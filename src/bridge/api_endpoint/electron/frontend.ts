import type { Prisma } from "@prisma/client";
import { EndpointFrontend } from "../frontend";
import { type Feed } from '$lib/types';


/** This class uses Electron's IPC to perform actions on the backend. The methods are defined in src/backend/main/electron/preload.ts */
export class ElectronEndpointFrontend extends EndpointFrontend {
    protected async itemUpdate(request: Prisma.ItemUpdateArgs): Promise<void> {
        await window.electronAPI.itemUpdate(request);
    }

    async getSummary(item_id: number): Promise<ReadableStream<string>> {
        return window.electronAPI.getSummary(item_id);
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
}