import { db } from '$src/backend/database';
import { filters } from '$modules/filters';
import { Prisma } from '@prisma/client';
import type { Block, DisplayItem, PrismaFilter } from '$lib/types';
import { getValuesUnderKeys, omitKeysFromObject } from '$lib/utils';

export type ItemsIteratorInstructions = {
    block: Block,
    feedTitle: string,
    pageSize: number
}

/**
 * ItemsIterator: Streams items from the database for a single block.
 * Handles pagination and filter application.
 *
 * The frontend/digester is responsible for orchestrating multiple blocks.
 */
export class ItemsIterator {
    stream: ReadableStream;
    private block: Block;
    private feedTitle: string;
    private query: Prisma.ItemFindManyArgs;
    private relevantFilters: Promise<PrismaFilter[]>;
    private batchSize: number;
    private stopLoadingIfNotItemsFor: number | null;
    private notItemsFor: number = 0;
    private exhausted: boolean = false;

    constructor({ block, feedTitle, pageSize }: ItemsIteratorInstructions) {
        this.batchSize = pageSize * 10;
        this.block = block;
        this.feedTitle = feedTitle;
        // Get query from args.query (deep copy since we modify it)
        const query = block.args?.query ?? {};
        this.query = JSON.parse(JSON.stringify(query));
        this.stopLoadingIfNotItemsFor = block.stop_loading_if_not_items_for ?? null;
        this.relevantFilters = this.getRelevantFilters(this.query);
        this.stream = this.initStream(pageSize * 2);
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
        if (this.exhausted) {
            console.log('Block exhausted. Closing stream.');
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
            console.log('No more candidate items found. Block exhausted.');
            this.exhausted = true;
            controller.close();
            return false;
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
        const seenItemIds: number[] = [];
        for (const itemPromise of updatedItems) {
            const item = await itemPromise; // Wait for the operations to finish for this item
            if (item) {
                controller.enqueue({
                    ...item,
                    block_title: this.block.title,
                    feed_title: this.feedTitle
                });
                seenItemIds.push(item.id);
                console.log('Enqueued item:', item.id);
            }
            if (this.query?.take && seenItemIds.length >= this.query.take) {
                console.log('Found enough items. Block exhausted.');
                this.exhausted = true;
                controller.close();
                return false;
            }
        }

        // At this point, we have processed all candidate items without finding enough items.
        // We need to alter the query to go to the next batch of items.
        this.query = {
            ...this.query,
            take: this.query.take ? this.query.take - seenItemIds.length : undefined,
            where: {
                AND: [
                    this.query.where ?? { id: { gte: 0 } }, // Again we use a vacuous condition that will always be true due to how Prisma behaves.
                    { id: { notIn: seenItemIds } }
                ]
            }
        }
        console.log('Altered query:', this.query);

        if (this.stopLoadingIfNotItemsFor) {
            if (seenItemIds.length === 0) {
                this.notItemsFor += candidateItems.length;
            } else {
                this.notItemsFor = 0;
            }
            if (this.notItemsFor >= this.stopLoadingIfNotItemsFor) {
                console.log(`No items satisfying filter conditions found within ${this.stopLoadingIfNotItemsFor} items. Closing stream.`);
                this.exhausted = true;
                controller.close();
                return false;
            }
        }

        // If no items were found, try again. Otherwise, let the controller pull again when it's ready.
        if (seenItemIds.length === 0) {
            return true;
        } else {
            return false;
        }
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
}