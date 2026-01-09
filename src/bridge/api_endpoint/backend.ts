import type { Prisma, Item } from "@prisma/client";
import { db } from '$src/backend/database';
import { handleSummarizeRequest } from '$src/backend/summarize';
import { generateDigest as generateDigestBackend, getDigestItems as getDigestItemsBackend } from '$src/backend/digest';
import { loadConfig, type ConfigQuery } from '$src/backend/load_config';
import { fetchItemsFromSources } from '$src/backend/fetch';
import { getFeedData as getFeedDataBackend, getAvailableSources as getAvailableSourcesBackend, getAvailableFilters as getAvailableFiltersBackend, getAvailableBlocks as getAvailableBlocksBackend } from '$src/backend/feeds';
import { validateRssFeed as validateRssFeedBackend, discoverRssFeeds as discoverRssFeedsBackend, type RssValidationResult, type RssDiscoveryResult } from '$src/backend/rss';
import { addRssSource as addRssSourceBackend, addQuery as addQueryBackend, addDigest as addDigestBackend, addFeed as addFeedBackend, type OperationResult } from '$src/backend/config_operations';
import type { Feed, DigestDisplayItem } from '$lib/types';
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
        console.log('Loading config from file...');
        await loadConfig();
        console.log('Fetching new items from sources...');
        await fetchItemsFromSources();
    }

    protected async getFeedData(): Promise<Feed[]> {
        return getFeedDataBackend();
    }

    protected async generateDigest(blockTitle: string): Promise<ReadableStream<string>> {
        return generateDigestBackend(blockTitle);
    }

    protected async getDigestItems(itemIds: number[]): Promise<DigestDisplayItem[]> {
        return getDigestItemsBackend(itemIds);
    }

    protected async getRawConfig(configPath: string | undefined = process.env.CONFIG_PATH): Promise<string> {
        if (!configPath) {
            throw new Error('CONFIG_PATH is not set');
        }
        return fs.readFileSync(configPath, 'utf8');
    }

    protected async validateRssFeed(url: string): Promise<RssValidationResult> {
        return validateRssFeedBackend(url);
    }

    protected async discoverRssFeeds(websiteUrl: string): Promise<RssDiscoveryResult> {
        return discoverRssFeedsBackend(websiteUrl);
    }

    protected async addRssSource(source: {
        name: string;
        urls: string[];
        defaultValues?: {
            item_type?: 'Article' | 'Link';
            lang_id?: string;
            summarizable?: boolean;
        };
    }): Promise<OperationResult> {
        const configPath = process.env.CONFIG_PATH;
        if (!configPath) {
            return { success: false, error: 'CONFIG_PATH not set' };
        }
        return addRssSourceBackend(configPath, source);
    }

    protected async addQuery(
        query: ConfigQuery,
        createFeed: boolean = true
    ): Promise<OperationResult> {
        const configPath = process.env.CONFIG_PATH;
        if (!configPath) {
            return { success: false, error: 'CONFIG_PATH not set' };
        }
        return addQueryBackend(configPath, query, createFeed);
    }

    protected async getAvailableSources(): Promise<string[]> {
        return getAvailableSourcesBackend();
    }

    protected async getAvailableFilters(): Promise<Array<{ title: string; implementation: string }>> {
        return getAvailableFiltersBackend();
    }

    protected async getAvailableBlocks(): Promise<Array<{ title: string; implementation: string }>> {
        return getAvailableBlocksBackend();
    }

    protected async addDigest(block: {
        title: string;
        implementation: string;
        args: {
            input_blocks: string[];
            focus_areas?: string[];
            [key: string]: any;
        };
    }): Promise<OperationResult> {
        const configPath = process.env.CONFIG_PATH;
        if (!configPath) {
            return { success: false, error: 'CONFIG_PATH not set' };
        }
        return addDigestBackend(configPath, block);
    }

    protected async addFeed(feed: {
        title: string;
        blocks: string[];
    }): Promise<OperationResult> {
        const configPath = process.env.CONFIG_PATH;
        if (!configPath) {
            return { success: false, error: 'CONFIG_PATH not set' };
        }
        return addFeedBackend(configPath, feed);
    }
}
