import { db } from './database';
import { filters } from '$modules/filters';
import { Prisma } from '@prisma/client';
import type { Feed, Block, DisplayItem, PrismaFilter, ItemWithFiltersChecked } from '$lib/types';
import { getValuesUnderKeys, omitKeysFromObject } from '$lib/utils';

export type ItemsStreamInstructions = {
    blocks: Block[],
    pageSize: number
}

export class ItemsStream {
    stream: ReadableStream;
    blockStack: Block[];
    blockTitle: string | undefined = undefined;
    query: Prisma.ItemFindManyArgs | undefined = undefined;
    cursor: number | null = null;
    batchSize: number = 50;

    constructor({ blocks, pageSize }: ItemsStreamInstructions) {
        console.log('Initializing items stream with instructions', { blocks, pageSize });
        this.blockStack = [...blocks].reverse(); // Create a shallow copy of the blocks array. We will pop from the end of the array, so we need to reverse it.
        const block = this.blockStack.pop();
        this.blockTitle = block?.title;
        this.query = JSON.parse(JSON.stringify(block?.query || {})); // Make a deep copy of the query because we may modify it.
        this.stream = this.initStream();
    }

    initStream(): ReadableStream<DisplayItem> {
        return new ReadableStream<DisplayItem>({
            pull: async (controller) => {
                console.log('Pulling items from stream...');
                if (!this.blockTitle || !this.query) {
                    console.log('No more blocks to process. Closing stream.');
                    controller.close();
                    return;
                }

                // Get the filters that are relevant for the current query, based on this.query.where. 
                const relevantFilterTitles = getValuesUnderKeys(this.query, ['where', 'filters_passed']);
                const relevantFilters = await db.filter.findMany({
                    where: {
                        title: {
                            in: relevantFilterTitles
                        }
                    }
                });

                // todo: use Promise.all to fetch candidateItems and relevantFilters in parallel. 
                // This seems more annoying than it should be because Prisma's findMany returns a PrismaPromise, and not a regular promise.

                // Fetch candidateItems, namely those items that satisfy the query, or have not been checked for all relevant filters.
                // Example: Given { where: { filters_passed: { some: { title: 'foo' } } } }, the resulting items should be 
                // - items for which the filter 'foo' has been checked and passed,
                // - items for which the filter 'foo' has not been checked.
                const todoRemove = {
                    ...this.query,
                    include: {
                        ...this.query.include,
                        authors: true,
                        filters_checked: true,
                        filters_passed: true
                    },
                    where: {
                        OR: [
                            this.query.where || {}, 
                            {   
                                AND: [
                                    // Only get items that satisfy the part of the query not using filters_passed
                                    omitKeysFromObject(this.query.where || {}, 'filters_passed'), 

                                    // Items that have not been checked for all relevant filters
                                    {
                                        OR: relevantFilterTitles.map(filterTitle => ({
                                            filters_checked: { none: { title: filterTitle } }
                                        }))
                                    }
                                ]
                            }
                        ]
                    },
                    take: this.batchSize
                };
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
                            this.query.where || { id: { gte: 0 } }, // Because of how Prisma handles OR, we need a condition that will always be true, otherwise we will get no items.
                            {   
                                AND: [
                                    // Only get items that satisfy the part of the query not using filters_passed
                                    omitKeysFromObject(this.query.where || {}, 'filters_passed'), 

                                    // Items that have not been checked for all relevant filters.
                                    {
                                        OR: relevantFilterTitles.length > 0 ? relevantFilterTitles.map(filterTitle => ({
                                            filters_checked: { none: { title: filterTitle } }
                                        })) : [{ id: { gte: 0 } }]
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
                    return;
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
                                const passes = await filters[filter.implementation](JSON.parse(filter.args || '{}'))(item);
                                return [filter, passes] as const;
                            })
                        ).then(results => results.filter(([_, passes]) => passes).map(([filter, _]) => filter));
                        await db.item.update({
                            where: { id: item.id },
                            data: {
                                filters_checked: {
                                    connect: uncheckedRelevantFilters.map(filter => ({ title: filter.title }))
                                },
                                filters_passed: {
                                    connect: itemPassesUncheckedRelevantFilters.map(filter => ({ title: filter.title }))
                                }
                            }
                        });
                        return await db.item.findFirst({
                            ...this.query,
                            where: {
                                ...this.query?.where,
                                id: item.id
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
                            block_title: this.blockTitle
                        });
                        taken++;
                    }
                    if (this.query?.take && taken >= this.query.take) {
                        console.log('Found enough items. Going to next block.');
                        this.goToNextBlock();
                        return;
                    }
                }

                // At this point, we have processed all candidate items without finding enough items.
                // We need to alter the query to go to the next page of items.
                this.query = {
                    ...this.query,
                    skip: this.query.skip ? this.query.skip + taken : taken,
                    take: this.query.take ? this.query.take - taken : undefined
                }
                console.log('Altered query:', this.query);
            }
        },
        new CountQueuingStrategy({ highWaterMark: this.highWaterMark(this.batchSize) })
    );
    }

    private async getRelevantFilters(query: Prisma.ItemFindManyArgs): Promise<PrismaFilter[]> {
        const relevantFilterTitles = await getValuesUnderKeys(query, ['where', 'filters_passed']);
        const relevantFilters = await db.filter.findMany({
            where: {
                title: {
                    in: relevantFilterTitles
                }
            }
        });
        return relevantFilters;
    }

    private goToNextBlock() {
        const block = this.blockStack.pop();
        this.blockTitle = block?.title;
        this.query = JSON.parse(JSON.stringify(block?.query || {})); // Make a deep copy of the query because we may modify it.
    }

    private highWaterMark(pageSize: number): number {
        return 2*pageSize;
    }

    setInstructions({ blocks, pageSize }: ItemsStreamInstructions): void {
        throw new Error('Not implemented');
    }

    checkAhead(feed: Feed): Promise<void> {
        throw new Error('Not implemented');
        // todo: apply filters to next items in line ahead of time.
    }
}