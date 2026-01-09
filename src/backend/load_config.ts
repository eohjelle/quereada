import { db } from '$src/backend/database';
import type { Prisma } from '@prisma/client';
import { importTypescript } from '$src/lib/import';
import { refreshSources } from '$root/modules/sources';
import type { ItemType } from '$lib/types';

export type ConfigSource = Pick<Prisma.SourceCreateInput, 'name' | 'implementation'> 
    & { args?: Record<string, any> } // channels, etc.
    & { default_values?: {
        item_type?: ItemType,
        lang_id?: string,
        authors?: string[],
        summarizable?: boolean
    } };
export type ConfigFilter = Pick<Prisma.FilterCreateInput, 'title' | 'implementation'> & { args?: Record<string, any> };
export type ConfigQuery = { title: string } & Omit<Prisma.ItemFindManyArgs, 'include'>;
export type ConfigBlock = Pick<Prisma.BlockCreateInput, 'title'>
    & { implementation: string }  // Required for blocks (e.g., "NewsBriefing")
    & { args: {
        input_blocks?: string[];  // For digester blocks
        [key: string]: any;
    }};
export type ConfigFeed = Pick<Prisma.FeedCreateInput, 'title'> & { blocks: string[] };

export async function loadConfig(): Promise<void> {
    const { sources, filters, queries, blocks, feeds } = await importTypescript(process.env.CONFIG_PATH!) as {
        sources: ConfigSource[], filters: ConfigFilter[], queries?: ConfigQuery[], blocks?: ConfigBlock[], feeds: ConfigFeed[]
    };

    // Upsert sources with channels
    await Promise.all(sources.map(async (source) => {
        const source_data = {
             ...source,
             args: source.args ? JSON.stringify(source.args) : undefined,
             default_values: source.default_values ? JSON.stringify(source.default_values) : undefined
        };
        await db.source.upsert({
            where: { name: source.name },
            update: source_data,
            create: source_data
        });
    }));

    // Upsert filters
    await Promise.all(filters.map(async (filter) => {
        const filter_data = {
            ...filter,
            args: filter.args ? JSON.stringify(filter.args) : undefined
        };
        await db.filter.upsert({
            where: { title: filter.title },
            update: filter_data,
            create: filter_data
        });
    }));

    // Upsert queries as ItemsStream blocks
    await Promise.all((queries ?? []).map(async (query) => {
        const { title, ...queryFields } = query;
        const block_data = {
            title: title,
            implementation: 'ItemsStream',
            args: JSON.stringify({ query: queryFields })
        };
        await db.block.upsert({
            where: { title },
            update: block_data,
            create: block_data
        });
    }));

    // Upsert blocks (digesters)
    await Promise.all((blocks ?? []).map(async (block) => {
        const block_data = {
            title: block.title,
            implementation: block.implementation,
            args: JSON.stringify(block.args)
        };
        await db.block.upsert({
            where: { title: block.title },
            update: block_data,
            create: block_data
        });
    }));

    // Reset orderedBlocksInFeed
    await db.orderedBlocksInFeed.deleteMany();

    // Upsert feeds
    await Promise.all(feeds.map(async (feed, index) => {
        const feed_data = {
            index: index,
            title: feed.title,
            blocks: {
                connectOrCreate: feed.blocks.map((block_title, index) => ({
                    where: {
                        feed_title_block_title_index: {
                            index: index,
                            feed_title: feed.title,
                            block_title: block_title
                        }
                    },
                    create: {
                        index: index,
                        block: {
                            connect: {
                                title: block_title
                            }
                        }
                    }
                }))
            }
        };
        await db.feed.upsert({
            where: { title: feed.title },
            update: feed_data,
            create: feed_data
        });
    }));

    // Remove unused feeds and blocks. todo: mark as inactive instead of deleting?
    await db.feed.deleteMany({
        where: {
            title: { notIn: feeds.map(feed => feed.title) }
        }
    });

    // Collect all valid block titles from both queries and blocks
    const allBlockTitles = [
        ...(queries ?? []).map(q => q.title),
        ...(blocks ?? []).map(b => b.title)
    ];
    await db.block.deleteMany({
        where: {
            title: { notIn: allBlockTitles }
        }
    });

    // Delete sources that are not in the config. Cascading deletes items.
    await db.source.deleteMany({
        where: {
            name: { notIn: sources.map(source => source.name) }
        }
    });

    await refreshSources();
}
