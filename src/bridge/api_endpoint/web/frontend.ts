import type { Prisma } from "@prisma/client";
import { EndpointFrontend } from "../frontend";
import { type Feed } from '$lib/types';

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
        console.log(`Requesting summary for item ${item_id}...`);
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
}