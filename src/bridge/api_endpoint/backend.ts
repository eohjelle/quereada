import type { Prisma, Item } from "@prisma/client";
import { db } from '$src/backend/database';
import { handleSummarizeRequest } from '$src/backend/summarize';
import { generateDigest as generateDigestBackend, getDigestItems as getDigestItemsBackend } from '$src/backend/digest';
import { loadConfig, type ConfigSource, type ConfigQuery, type ConfigFeed, type ConfigBlock } from '$src/backend/load_config';
import { fetchItemsFromSources } from '$src/backend/fetch';
import { type Feed, type DigestDisplayItem } from '$lib/types';
import { addSourceToConfig, addQueryToConfig, addQueryAndFeedToConfig, addBlockToConfig, addFeedOnlyToConfig } from '$src/lib/config-writer';
import { extract } from '@extractus/feed-extractor';
import { JSDOM } from 'jsdom';
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
        const feeds = await db.feed.findMany({include: { blocks: { select: { block: true, index: true }, orderBy: { index: "asc" } } }, orderBy: { index: "asc" } });
        const parsedFeeds = feeds.map((feed) => {
            return {
                ...feed,
                blocks: feed.blocks
                    .sort((block) => block.index)
                    .map((block) => {
                        return {
                            title: block.block.title,
                            implementation: block.block.implementation,
                            args: JSON.parse(block.block.args),
                            stop_loading_if_not_items_for: block.block.stop_loading_if_not_items_for
                        }
                })
            }
        });
        return parsedFeeds;
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

    /**
     * Validate an RSS feed URL by attempting to fetch and parse it
     */
    protected async validateRssFeed(url: string): Promise<{
        valid: boolean;
        title?: string;
        itemCount?: number;
        error?: string;
    }> {
        try {
            const feed = await extract(url);
            return {
                valid: true,
                title: feed?.title,
                itemCount: feed?.entries?.length ?? 0
            };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Discover RSS feeds from a website URL
     */
    protected async discoverRssFeeds(websiteUrl: string): Promise<{
        feeds: Array<{ url: string; title?: string }>;
        error?: string;
    }> {
        try {
            // Normalize URL
            let url = websiteUrl;
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }

            // Fetch the webpage
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Quereada RSS Reader/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const html = await response.text();
            const dom = new JSDOM(html);
            const document = dom.window.document;

            const feeds: Array<{ url: string; title?: string }> = [];

            // Find RSS/Atom link elements
            const linkElements = document.querySelectorAll(
                'link[rel="alternate"][type="application/rss+xml"], ' +
                'link[rel="alternate"][type="application/atom+xml"], ' +
                'link[rel="alternate"][type="application/feed+json"]'
            );

            for (const link of linkElements) {
                const href = link.getAttribute('href');
                const title = link.getAttribute('title');

                if (href) {
                    // Resolve relative URLs
                    const feedUrl = new URL(href, url).toString();
                    feeds.push({ url: feedUrl, title: title || undefined });
                }
            }

            // If no feeds found via link tags, try common paths
            if (feeds.length === 0) {
                const commonPaths = [
                    '/feed',
                    '/feed.xml',
                    '/rss',
                    '/rss.xml',
                    '/atom.xml',
                    '/feed/rss',
                    '/index.xml'
                ];

                const baseUrl = new URL(url);
                for (const path of commonPaths) {
                    try {
                        const testUrl = new URL(path, baseUrl).toString();
                        const validation = await this.validateRssFeed(testUrl);
                        if (validation.valid) {
                            feeds.push({ url: testUrl, title: validation.title });
                            break; // Found one, stop checking
                        }
                    } catch {
                        // Continue to next path
                    }
                }
            }

            return { feeds };
        } catch (error) {
            return {
                feeds: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Add a new RSS source to the config file
     */
    protected async addRssSource(source: {
        name: string;
        urls: string[];
        defaultValues?: {
            item_type?: 'Article' | 'Link';
            lang_id?: string;
            summarizable?: boolean;
        };
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const configPath = process.env.CONFIG_PATH;
            if (!configPath) throw new Error('CONFIG_PATH not set');

            // Check for duplicate source name
            const existingSource = await db.source.findUnique({
                where: { name: source.name }
            });
            if (existingSource) {
                throw new Error(`Source with name "${source.name}" already exists`);
            }

            const configSource: ConfigSource = {
                name: source.name,
                implementation: 'RSS',
                args: { urls: source.urls },
                default_values: source.defaultValues
            };

            await addSourceToConfig(configPath, configSource);
            await this.refreshFeeds();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Add a new query to the config file
     */
    protected async addQuery(
        query: ConfigQuery,
        createFeed: boolean = true
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const configPath = process.env.CONFIG_PATH;
            if (!configPath) throw new Error('CONFIG_PATH not set');

            // Check for duplicate block title
            const existingBlock = await db.block.findUnique({
                where: { title: query.title }
            });
            if (existingBlock) {
                throw new Error(`Query/block with title "${query.title}" already exists`);
            }

            if (createFeed) {
                await addQueryAndFeedToConfig(configPath, query);
            } else {
                await addQueryToConfig(configPath, query);
            }

            await loadConfig();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get list of available source names
     */
    protected async getAvailableSources(): Promise<string[]> {
        const sources = await db.source.findMany({
            select: { name: true },
            orderBy: { name: 'asc' }
        });
        return sources.map(s => s.name);
    }

    /**
     * Get list of available filters with their titles
     */
    protected async getAvailableFilters(): Promise<Array<{ title: string; implementation: string }>> {
        const filters = await db.filter.findMany({
            select: { title: true, implementation: true },
            orderBy: { title: 'asc' }
        });
        return filters;
    }

    /**
     * Get list of available blocks (queries and digesters)
     */
    protected async getAvailableBlocks(): Promise<Array<{ title: string; implementation: string }>> {
        const blocks = await db.block.findMany({
            select: { title: true, implementation: true },
            orderBy: { title: 'asc' }
        });
        return blocks;
    }

    /**
     * Add a new digest block to the config file
     */
    protected async addDigest(block: {
        title: string;
        implementation: string;
        args: {
            input_blocks: string[];
            focus_areas?: string[];
            [key: string]: any;
        };
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const configPath = process.env.CONFIG_PATH;
            if (!configPath) throw new Error('CONFIG_PATH not set');

            // Check for duplicate block title
            const existingBlock = await db.block.findUnique({
                where: { title: block.title }
            });
            if (existingBlock) {
                throw new Error(`Block with title "${block.title}" already exists`);
            }

            const configBlock: ConfigBlock = {
                title: block.title,
                implementation: block.implementation,
                args: block.args
            };

            await addBlockToConfig(configPath, configBlock);
            await loadConfig();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Add a new feed to the config file
     */
    protected async addFeed(feed: {
        title: string;
        blocks: string[];
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const configPath = process.env.CONFIG_PATH;
            if (!configPath) throw new Error('CONFIG_PATH not set');

            // Check for duplicate feed title
            const existingFeed = await db.feed.findUnique({
                where: { title: feed.title }
            });
            if (existingFeed) {
                throw new Error(`Feed with title "${feed.title}" already exists`);
            }

            const configFeed: ConfigFeed = {
                title: feed.title,
                blocks: feed.blocks
            };

            await addFeedOnlyToConfig(configPath, configFeed);
            await loadConfig();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}