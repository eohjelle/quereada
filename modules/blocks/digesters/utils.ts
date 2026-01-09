import { db } from '$src/backend/database';
import type { DisplayItem, DigestItem } from '$lib/types';

/**
 * Collects all items from a ReadableStream into an array.
 */
export async function collectItems(stream: ReadableStream<DisplayItem>): Promise<DisplayItem[]> {
    const items: DisplayItem[] = [];
    const reader = stream.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            items.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    return items;
}

/**
 * Fetches additional fields for items that digesters need (like content).
 * DisplayItem doesn't include content, but DigestItem does.
 *
 * @param itemIds - Array of item IDs to fetch
 * @returns Array of DigestItems with full data including content
 */
export async function fetchDigestItems(itemIds: number[]): Promise<DigestItem[]> {
    const items = await db.item.findMany({
        where: { id: { in: itemIds } },
        include: { authors: true }
    });

    return items as DigestItem[];
}

/**
 * Converts DisplayItems to DigestItems by fetching additional fields.
 * Useful for digesters that need content or other fields not in DisplayItem.
 */
export async function toDigestItems(displayItems: DisplayItem[]): Promise<DigestItem[]> {
    const itemIds = displayItems.map(item => item.id);
    return fetchDigestItems(itemIds);
}
