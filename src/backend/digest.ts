import { db } from '$src/backend/database';
import { digesters } from '$root/modules/digesters';
import type { DigestItem, DigestDisplayItem } from '$lib/types';

/**
 * Generate a digest for a block.
 * Fetches items matching the block's query and processes them through the digester.
 *
 * @param blockTitle - The title of the block to generate a digest for
 * @returns A ReadableStream of the digest content
 */
export async function generateDigest(blockTitle: string): Promise<ReadableStream<string>> {
    // Get the block from the database
    const block = await db.block.findUnique({
        where: { title: blockTitle }
    });

    if (!block) {
        throw new Error(`Block "${blockTitle}" not found`);
    }

    if (block.implementation === 'ItemsStream') {
        throw new Error(`Block "${blockTitle}" is not a digest block (implementation is ItemsStream)`);
    }

    // Get the digester constructor
    const digesterConstructor = digesters[block.implementation];
    if (!digesterConstructor) {
        throw new Error(`Digester implementation "${block.implementation}" not found`);
    }

    // Parse the query and args
    const query = JSON.parse(block.query);
    const args = block.args ? JSON.parse(block.args) : {};

    // Fetch items matching the query
    const items = await db.item.findMany({
        ...query,
        include: {
            authors: true
        }
    }) as DigestItem[];

    // Create the digester and generate the digest
    const digester = digesterConstructor(args);
    return digester(items);
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
