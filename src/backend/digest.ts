import { db } from '$src/backend/database';
import { BlockExecutor } from '$root/modules/blocks';
import type { DigestDisplayItem } from '$lib/types';

/**
 * Generate a digest for a block.
 * Uses BlockExecutor to properly handle input_blocks and chaining.
 *
 * @param blockTitle - The title of the block to generate a digest for
 * @param feedTitle - Optional feed title for context
 * @returns A ReadableStream of the digest content
 */
export async function generateDigest(blockTitle: string, feedTitle: string = ''): Promise<ReadableStream<string>> {
    // Get the block from the database to verify it's a digest block
    const block = await db.block.findUnique({
        where: { title: blockTitle }
    });

    if (!block) {
        throw new Error(`Block "${blockTitle}" not found`);
    }

    if (block.implementation === 'ItemsStream') {
        throw new Error(`Block "${blockTitle}" is not a digest block (implementation is ItemsStream)`);
    }

    // Use BlockExecutor to handle input_blocks and chaining
    const executor = new BlockExecutor(feedTitle);
    const output = await executor.execute(blockTitle);

    if (output.type !== 'content') {
        throw new Error(`Block "${blockTitle}" did not produce content output`);
    }

    return output.stream;
}

/**
 * Get items by their IDs for inline expansion in digests.
 * Returns full item data for display using ItemContainer.
 *
 * @param itemIds - Array of item IDs to fetch
 * @returns Array of items with their data
 */
export async function getDigestItems(itemIds: number[]): Promise<DigestDisplayItem[]> {
    const items = await db.item.findMany({
        where: {
            id: { in: itemIds }
        },
        include: {
            authors: true
        }
    });

    return items as DigestDisplayItem[];
}
