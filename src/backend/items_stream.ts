import { db } from './database';
import { filters } from '$modules/filters';
import { Prisma } from '@prisma/client';
import type { Feed, Block, DisplayItem, PrismaFilter, ItemWithFiltersChecked } from '$lib/types';
import { getValuesUnderKeys, omitKeysFromObject } from '$lib/utils';

export type ItemsStreamInstructions = {
    feed: Feed,
    pageSize: number
}

export class ItemsStream {
    stream: ReadableStream;
    private feed: Feed;
    private blockQueue: Block[];
    private currentBlock: Block | undefined = undefined;
    private query!: Prisma.ItemFindManyArgs; // initialized in constructor
    private relevantFilters!: Promise<PrismaFilter[]>; // initialized in constructor
    private batchSize: number;
    private stopLoadingIfNotItemsFor!: number | null; // set in goToNextBlock
    private notItemsFor: number = 0;

    constructor({ feed, pageSize }: ItemsStreamInstructions) {
        this.batchSize = pageSize*10;
        this.feed = feed;
        this.blockQueue = [...feed.blocks]; // Create a shallow copy of the blocks array.
        this.goToNextBlock();
        this.stream = this.initStream(pageSize*2);
    }

    private initStream(highWaterMark: number): ReadableStream<DisplayItem> {
        return new ReadableStream<DisplayItem>({
            pull: async (controller) => {
                // This custom logic is needed when no items are found in the first batch.
                let tryAgain = true;
                while (tryAgain) {
                    tryAgain = await this.pullBatch(controller);
                }
            }
        },
        new CountQueuingStrategy({ highWaterMark: highWaterMark })
    );
    }

    private async pullBatch(controller: ReadableStreamDefaultController<DisplayItem>): Promise<boolean> {
        if (!this.currentBlock) {
            console.log('No more blocks to process. Closing stream.');
            controller.close();
            return false;
        }

        // The relevant filters for the current query.
        const relevantFilters = await this.relevantFilters;


        // Fetch candidateItems, namely those items that satisfy the query, or have not been checked for all relevant filters.
        // Example: Given { where: { filters_passed: { some: { title: 'foo' } } } }, the resulting items should be 
        // - items for which the filter 'foo' has been checked and passed,
        // - items for which the filter 'foo' has not been checked, that satisfy the query without using filters_passed.
        const candidateItems = await db.item.findMany({
            ...this.query,
            include: {
                ...this.query.include,
                authors: true,
                filters_checked: true,
                filters_passed: true
            },
            where: {
                OR: [
                    this.query.where ?? { id: { gte: 0 } }, // Because of how Prisma handles OR, we need a non-empty condition that will always be true.
                    {   
                        AND: [
                            // Only get items that satisfy the part of the query not using filters_passed
                            omitKeysFromObject(this.query.where || {}, 'filters_passed'), 

                            // Items that have not been checked for all relevant filters.
                            {
                                OR: relevantFilters.map(filter => ({filters_checked: { none: { title: filter.title } } }))
                            }
                        ]
                    }
                ]
            },
            take: this.batchSize
        }) as Prisma.ItemGetPayload<{ include: { authors: true, filters_checked: true, filters_passed: true } }>[];
        console.log('Candidate items ids:', candidateItems.map(item => item.id));

        if (candidateItems.length === 0) {
            console.log('No candidate items found. Going to next block.');
            this.goToNextBlock();
            return true;
        }
        
        // Make an array of promises, where the promise at index i resolves when all relevant filters for the item at index i have been checked.
        // The promise resolves to
        // - the item at index i, if all relevant filters for that item have been checked and the item satisfies the original query
        // - null, if all relevant filters for that item have been checked but the item does not satisfy the original query
        const updatedItems: Promise<Prisma.ItemGetPayload<{ include: { authors: true } }> | null>[] = candidateItems.map(async item => {
            const uncheckedRelevantFilters = relevantFilters.filter(filter => !item.filters_checked.some(checkedFilter => checkedFilter.title === filter.title));
            if (uncheckedRelevantFilters.length === 0) {
                return item;
            } else {
                const itemPassesUncheckedRelevantFilters = await Promise.all(
                    uncheckedRelevantFilters.map(async filter => {
                        try {
                            const passes = await filters[filter.implementation](JSON.parse(filter.args || '{}'))(item);
                            return [filter, passes] as const;
                        } catch (error) {
                            console.error(`Error applying filter ${filter.title} to item ${item.id}:`, error);
                            return [filter, undefined] as const;
                        }
                    })
                );
                await db.item.update({
                    where: { id: item.id },
                    data: {
                        filters_checked: {
                            connect: itemPassesUncheckedRelevantFilters.filter(([_, passes]) => passes !== undefined).map(([filter, _]) => ({ title: filter.title }))
                        },
                        filters_passed: {
                            connect: itemPassesUncheckedRelevantFilters.filter(([_, passes]) => passes === true).map(([filter, _]) => ({ title: filter.title }))
                        }
                    }
                });
                return await db.item.findFirst({
                    ...this.query,
                    where: {
                        AND: [
                            this.query.where ?? {},
                            { id: item.id }
                        ]
                    },
                    include: {
                        ...this.query?.include,
                        authors: true
                    }
                });
            }
        });

        // Traverse updatedItems in order and enqueue items.
        let taken = 0;
        for (const itemPromise of updatedItems) {
            const item = await itemPromise; // Wait for the operations to finish for this item
            if (item) {
                controller.enqueue({
                    ...item,
                    block_title: this.currentBlock.title,
                    feed_title: this.feed.title
                });
                taken++;
                console.log('Enqueued item:', item.id);
            }
            if (this.query?.take && taken >= this.query.take) {
                console.log('Found enough items. Going to next block.');
                this.goToNextBlock();
                return true;
            }
        }

        // At this point, we have processed all candidate items without finding enough items.
        // We need to alter the query to go to the next batch of items.
        this.query = {
            ...this.query,
            skip: this.query.skip ? this.query.skip + taken : taken,
            take: this.query.take ? this.query.take - taken : undefined
        }
        console.log('Altered query:', this.query);

        if (this.stopLoadingIfNotItemsFor) {
            if (taken === 0) {
                this.notItemsFor += candidateItems.length;
            } else {
                this.notItemsFor = 0;
            }
            if (this.notItemsFor >= this.stopLoadingIfNotItemsFor) {
                console.log(`No items satisfying filter conditions found within ${this.stopLoadingIfNotItemsFor} items. Closing stream.`);
                controller.close();
                return false;
            }
        }

        // If no items were found, try again. Otherwise, let the controller pull again when it's ready.
        if (taken === 0) {
            return true;
        } else {
            return false;
        }
    }

    private goToNextBlock() {
        this.currentBlock = this.blockQueue.shift();
        this.query = JSON.parse(JSON.stringify(this.currentBlock?.query || {})); // Make a deep copy of the query because we may modify it.
        this.stopLoadingIfNotItemsFor = this.currentBlock?.stop_loading_if_not_items_for ?? null;
        this.relevantFilters = this.query ? this.getRelevantFilters(this.query) : Promise.resolve([]);
    }

    private async getRelevantFilters(query: Prisma.ItemFindManyArgs): Promise<PrismaFilter[]> {
        // Get the filters that are relevant for the current query, based on this.query.where. 
        const relevantFilterTitles = getValuesUnderKeys(query, ['where', 'filters_passed']);
        return db.filter.findMany({
            where: {
                title: {
                    in: relevantFilterTitles
                }
            }
        });
    }

    setInstructions({ feed, pageSize }: ItemsStreamInstructions): void {
        throw new Error('Not implemented');
    }

    checkAhead(feed: Feed): Promise<void> {
        throw new Error('Not implemented');
        // todo: apply filters to next items in line ahead of time.
    }
}