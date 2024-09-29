import type { Prisma } from "@prisma/client";
import type { Feed } from "$lib/types";

export abstract class EndpointFrontend {
    protected abstract itemUpdate(request: Prisma.ItemUpdateArgs): Promise<void>;
    // Send a request to the backend to call db.item.update(request)

    abstract getSummary(item_id: number): Promise<ReadableStream<string>>;
    

    abstract refreshFeeds(): Promise<void>;
    // Send a request to the backend to fetch new items from the sources

    abstract getFeedData(): Promise<Feed[]>;

    abstract getRawConfig(): Promise<string>;

    // todo: updateSeen should also update seen_in_blocks field (connect origin block)
    async updateSeen(item_id: number, seen: boolean): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                seen: seen,
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

    async incrementClicked(item_id: number): Promise<void> {
        await this.itemUpdate({
            where: {
                id: item_id,
            },
            data: {
                clicked: { increment: 1 },
            },
        });
    }
}