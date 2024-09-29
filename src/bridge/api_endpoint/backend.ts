import type { Prisma, Item } from "@prisma/client";
import { db } from '$src/backend/database';
import { handleSummarizeRequest } from '$src/backend/summarize';
import { loadConfig } from '$src/backend/load_config';
import { fetchItemsFromSources } from '$src/backend/fetch';
import { type Feed } from '$lib/types';
import fs from 'fs';

export class EndpointBackend {
    // The constructor of the subclass should set up listeners for the following messages from the frontend:
    // - request to update an item (should call itemUpdate)
    // - request to summarize an item (should call getSummary)
    // - request to refresh feeds (should call refreshFeeds)
    // - request to get feed data (should call getFeedData)
    // - request to get raw config (should call getRawConfig)

    protected async itemUpdate(request: Prisma.ItemUpdateArgs): Promise<Item> {
        console.log('Received request to update item:', request);
        return db.item.update(request);
    }

    protected async getSummary(item_id: number): Promise<ReadableStream<string>> {
        return handleSummarizeRequest(item_id);
    }

    protected async refreshFeeds(): Promise<void> {
        // todo: await fetchingPromise global variable
        console.log('Loading config from file...');
        await loadConfig();
        console.log('Fetching new items from sources...');
        await fetchItemsFromSources();
    }

    protected async getFeedData(): Promise<Feed[]> {
        const feeds = await db.feed.findMany({include: { blocks: { include: { block: true } } }, orderBy: { index: "asc" } });
        const parsedFeeds = feeds.map((feed) => {
            return {
                ...feed,
                blocks: feed.blocks
                    .sort((block) => block.index)
                    .map((block) => {
                        return {
                            title: block.block.title,
                            query: JSON.parse(block.block.query) as Prisma.ItemFindManyArgs
                        }
                })
            }
        });
        return parsedFeeds;
    }

    protected async getRawConfig(configPath: string | undefined = process.env.CONFIG_PATH): Promise<string> {
        if (!configPath) {
            throw new Error('CONFIG_PATH is not set');
        }
        return fs.readFileSync(configPath, 'utf8');
    }
}