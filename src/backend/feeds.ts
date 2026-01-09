import { db } from './database';
import type { Feed } from '$lib/types';

/**
 * Get all feeds with their blocks, properly parsed and ordered.
 */
export async function getFeedData(): Promise<Feed[]> {
    const feeds = await db.feed.findMany({
        include: {
            blocks: {
                select: { block: true, index: true },
                orderBy: { index: "asc" }
            }
        },
        orderBy: { index: "asc" }
    });

    return feeds.map((feed) => ({
        ...feed,
        blocks: feed.blocks
            .sort((a, b) => a.index - b.index)
            .map((block) => ({
                title: block.block.title,
                implementation: block.block.implementation,
                args: JSON.parse(block.block.args),
                stop_loading_if_not_items_for: block.block.stop_loading_if_not_items_for
            }))
    }));
}

/**
 * Get list of available source names
 */
export async function getAvailableSources(): Promise<string[]> {
    const sources = await db.source.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
    });
    return sources.map(s => s.name);
}

/**
 * Get list of available filters with their titles
 */
export async function getAvailableFilters(): Promise<Array<{ title: string; implementation: string }>> {
    const filters = await db.filter.findMany({
        select: { title: true, implementation: true },
        orderBy: { title: 'asc' }
    });
    return filters;
}

/**
 * Get list of available blocks (queries and digesters)
 */
export async function getAvailableBlocks(): Promise<Array<{ title: string; implementation: string }>> {
    const blocks = await db.block.findMany({
        select: { title: true, implementation: true },
        orderBy: { title: 'asc' }
    });
    return blocks;
}
