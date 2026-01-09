import type { Prisma } from "@prisma/client";
import { EndpointFrontend } from "../frontend";
import { type Feed, type DigestDisplayItem } from '$lib/types';


/** This class uses Electron's IPC to perform actions on the backend. The methods are defined in src/backend/main/electron/preload.ts */
export class ElectronEndpointFrontend extends EndpointFrontend {
    protected async itemUpdate(request: Prisma.ItemUpdateArgs): Promise<void> {
        await window.electronAPI.itemUpdate(request);
    }

    async getSummary(item_id: number): Promise<ReadableStream<string>> {
        let removeListener: () => void;
        return new ReadableStream({
            start: async (controller) => {
                removeListener = await window.electronAPI.getSummary(item_id, (chunk) => {
                    if (chunk === null) {
                        controller.close();
                    } else {
                        controller.enqueue(chunk);
                    }
                });
            },
            cancel() {
                removeListener();
            }
        });
    }

    async refreshFeeds(): Promise<void> {
        await window.electronAPI.refreshFeeds();
    }

    async getFeedData(): Promise<Feed[]> {
        return window.electronAPI.getFeedData();
    }

    async getRawConfig(): Promise<string> {
        return window.electronAPI.getRawConfig();
    }

    async generateDigest(blockTitle: string): Promise<ReadableStream<string>> {
        let removeListener: () => void;
        return new ReadableStream({
            start: async (controller) => {
                removeListener = await window.electronAPI.generateDigest(blockTitle, (chunk) => {
                    if (chunk === null) {
                        controller.close();
                    } else {
                        controller.enqueue(chunk);
                    }
                });
            },
            cancel() {
                removeListener();
            }
        });
    }

    async getDigestItems(itemIds: number[]): Promise<DigestDisplayItem[]> {
        return window.electronAPI.getDigestItems(itemIds);
    }

    async validateRssFeed(url: string): Promise<{
        valid: boolean;
        title?: string;
        itemCount?: number;
        error?: string;
    }> {
        return window.electronAPI.validateRssFeed(url);
    }

    async discoverRssFeeds(websiteUrl: string): Promise<{
        feeds: Array<{ url: string; title?: string }>;
        error?: string;
    }> {
        return window.electronAPI.discoverRssFeeds(websiteUrl);
    }

    async addRssSource(source: {
        name: string;
        urls: string[];
        defaultValues?: {
            item_type?: 'Article' | 'Link';
            lang_id?: string;
            summarizable?: boolean;
        };
    }): Promise<{ success: boolean; error?: string }> {
        return window.electronAPI.addRssSource(source);
    }

    async addQuery(
        query: { title: string; where?: any; orderBy?: any; take?: number },
        createFeed: boolean = true
    ): Promise<{ success: boolean; error?: string }> {
        return window.electronAPI.addQuery(query, createFeed);
    }

    async getAvailableSources(): Promise<string[]> {
        return window.electronAPI.getAvailableSources();
    }

    async getAvailableFilters(): Promise<Array<{ title: string; implementation: string }>> {
        return window.electronAPI.getAvailableFilters();
    }

    async getAvailableBlocks(): Promise<Array<{ title: string; implementation: string }>> {
        return window.electronAPI.getAvailableBlocks();
    }

    async addDigest(block: {
        title: string;
        implementation: string;
        args: {
            input_blocks: string[];
            focus_areas?: string[];
            [key: string]: any;
        };
    }): Promise<{ success: boolean; error?: string }> {
        return window.electronAPI.addDigest(block);
    }

    async addFeed(feed: {
        title: string;
        blocks: string[];
    }): Promise<{ success: boolean; error?: string }> {
        return window.electronAPI.addFeed(feed);
    }
}