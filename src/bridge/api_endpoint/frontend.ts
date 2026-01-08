import type { Prisma } from "@prisma/client";
import type { Feed, DigestDisplayItem } from "$lib/types";

export abstract class EndpointFrontend {
    protected abstract itemUpdate(request: Prisma.ItemUpdateArgs): Promise<void>;
    // Send a request to the backend to call db.item.update(request)

    abstract getSummary(item_id: number): Promise<ReadableStream<string>>;

    abstract generateDigest(blockTitle: string): Promise<ReadableStream<string>>;
    // Send a request to generate a digest for a block

    abstract getDigestItems(itemIds: number[]): Promise<DigestDisplayItem[]>;
    // Fetch items by ID for inline expansion in digests

    abstract refreshFeeds(): Promise<void>;
    // Send a request to the backend to fetch new items from the sources

    abstract getFeedData(): Promise<Feed[]>;

    abstract getRawConfig(): Promise<string>;

    async updateSeen(item_id: number, feed_title: string, block_title: string): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                seen: {
                    increment: 1,
                },
                seen_in_feeds: {
                    connect: {
                        title: feed_title,
                    }
                },
                seen_in_blocks: {
                    connect: {
                        title: block_title,
                    }
                }
            },
        });
    }

    async updateReadLater(item_id: number, read_later: boolean): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                read_later: read_later,
            },
        });
    }

    async updateSaved(item_id: number, saved: boolean): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                saved: saved,
            },
        });
    }

    async updateClicks (item_id: number, feed_title: string, block_title: string): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                clicks: {
                    increment: 1,
                },
                clicked_in_blocks: {
                    connect: {
                        title: block_title,
                    }
                },
                clicked_in_feeds: {
                    connect: {
                        title: feed_title,
                    }
                }
            }
        });
    }
}