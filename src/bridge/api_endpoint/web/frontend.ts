import type { Prisma } from "@prisma/client";
import { EndpointFrontend } from "../frontend";
import { type Feed, type DigestDisplayItem } from '$lib/types';

export class WebEndpointFrontend extends EndpointFrontend {
    protected async itemUpdate(request: Prisma.ItemUpdateArgs): Promise<void> {
        const response = await fetch("/api/update_item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error("Failed to update item");
        }
    }

    async getSummary(item_id: number): Promise<ReadableStream<string>> {
        const response = await fetch(`/api/get_summary?item_id=${item_id}`, {
            method: "GET"
        });

        if (!response.body) {
            throw new Error(`Request to get summary for item ${item_id} yielded a response with no body.`);
        }

        return response.body.pipeThrough(new TextDecoderStream());
    }

    async refreshFeeds(): Promise<void> {
        console.log("Refreshing feeds...");
        const response = await fetch("/api/refresh_feeds", {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Failed to refresh feeds");
        } else {
            console.log("Feeds refreshed successfully.");
        }
    }

    async getFeedData(): Promise<Feed[]> {
        const response = await fetch("/api/get_feed_data", {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Failed to get feed data");
        }
        return response.json();
    }

    async getRawConfig(): Promise<string> {
        const response = await fetch("/api/get_raw_config", {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("Failed to get raw config");
        }
        return response.text();
    }

    async generateDigest(blockTitle: string): Promise<ReadableStream<string>> {
        const response = await fetch(`/api/generate_digest?block_title=${encodeURIComponent(blockTitle)}`, {
            method: "GET"
        });

        if (!response.body) {
            throw new Error(`Request to generate digest for block ${blockTitle} yielded a response with no body.`);
        }

        return response.body.pipeThrough(new TextDecoderStream());
    }

    async getDigestItems(itemIds: number[]): Promise<DigestDisplayItem[]> {
        const response = await fetch("/api/get_digest_items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ item_ids: itemIds }),
        });

        if (!response.ok) {
            throw new Error("Failed to get digest items");
        }
        return response.json();
    }

    async validateRssFeed(url: string): Promise<{
        valid: boolean;
        title?: string;
        itemCount?: number;
        error?: string;
    }> {
        const response = await fetch("/api/validate_rss_feed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
        return response.json();
    }

    async discoverRssFeeds(websiteUrl: string): Promise<{
        feeds: Array<{ url: string; title?: string }>;
        error?: string;
    }> {
        const response = await fetch("/api/discover_rss_feeds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: websiteUrl }),
        });
        return response.json();
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
        const response = await fetch("/api/add_rss_source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(source),
        });
        return response.json();
    }

    async addQuery(
        query: { title: string; where?: any; orderBy?: any; take?: number },
        createFeed: boolean = true
    ): Promise<{ success: boolean; error?: string }> {
        const response = await fetch("/api/add_query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, createFeed }),
        });
        return response.json();
    }

    async getAvailableSources(): Promise<string[]> {
        const response = await fetch("/api/get_available_sources", {
            method: "GET",
        });
        return response.json();
    }

    async getAvailableFilters(): Promise<Array<{ title: string; implementation: string }>> {
        const response = await fetch("/api/get_available_filters", {
            method: "GET",
        });
        return response.json();
    }

    async getAvailableBlocks(): Promise<Array<{ title: string; implementation: string }>> {
        const response = await fetch("/api/get_available_blocks", {
            method: "GET",
        });
        return response.json();
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
        const response = await fetch("/api/add_digest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(block),
        });
        return response.json();
    }

    async addFeed(feed: {
        title: string;
        blocks: string[];
    }): Promise<{ success: boolean; error?: string }> {
        const response = await fetch("/api/add_feed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(feed),
        });
        return response.json();
    }
}