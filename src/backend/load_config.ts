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
export type ConfigBlock = Pick<Prisma.BlockCreateInput, 'title'> & { query: Omit<Prisma.ItemFindManyArgs, 'filters_checked'>, filters?: string[] };
export type ConfigFeed = Pick<Prisma.FeedCreateInput, 'title'> & { blocks: string[] };

export async function loadConfig(): Promise<void> {
    const { sources, filters, blocks, feeds } = await importTypescript(process.env.CONFIG_PATH!) as {
        sources: ConfigSource[], filters: ConfigFilter[], blocks: ConfigBlock[], feeds: ConfigFeed[]
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
    await refreshSources();

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

    // Upsert blocks
    await Promise.all(blocks.map(async (block) => {
        const block_data = {
            ...block,
            query: JSON.stringify(block.query),
            filters: block.filters ? { connect: block.filters.map(filter_title => ({ title: filter_title })) } : undefined
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
    await db.block.deleteMany({
        where: {
            title: { notIn: blocks.map(block => block.title) }
        }
    });

    // Delete sources that are not in the config. Cascading deletes items.
    await db.source.deleteMany({
        where: {
            name: { notIn: sources.map(source => source.name) }
        }
    });
}
