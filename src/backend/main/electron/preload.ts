import { contextBridge, ipcRenderer } from 'electron';
import type { Feed, DigestDisplayItem } from '$lib/types';
import type { Prisma } from '@prisma/client';
import type { FrontendRequest, Instructions, BackendResponse } from '$bridge/loading_items_to_feed/types';

/** This sets up the API used in src/bridge/api_endpoint/electron/frontend.ts */
contextBridge.exposeInMainWorld('electronAPI', {
    itemUpdate: (request: Prisma.ItemUpdateArgs) => ipcRenderer.invoke('update_item', request),
    getSummary: (item_id: number, callback: (chunk: string | null) => void) => {
        const summaryChunkHandler = (event: any, chunk: any) => {
            const { id, type, textChunk } = chunk as { id: number, type: 'chunk' | 'end', textChunk?: string };
            if (id === item_id && type === 'chunk' && textChunk !== undefined) {
                callback(textChunk);
            } else if (id === item_id && type === 'end') {
                callback(null); // Signify end of stream
                ipcRenderer.removeListener('summary', summaryChunkHandler);
            }
        };
        ipcRenderer.on('summary', summaryChunkHandler);
        ipcRenderer.send('get_summary', item_id);
        
        return () => {
            ipcRenderer.removeListener('summary', summaryChunkHandler);
        };
    },
    refreshFeeds: () => ipcRenderer.invoke('refresh_feeds'),
    getFeedData: () => ipcRenderer.invoke('get_feed_data'),
    getRawConfig: () => ipcRenderer.invoke('get_raw_config'),
    generateDigest: (blockTitle: string, callback: (chunk: string | null) => void) => {
        const digestChunkHandler = (event: any, data: any) => {
            const { blockTitle: bt, type, textChunk, error } = data as { blockTitle: string, type: 'chunk' | 'end' | 'error', textChunk?: string, error?: string };
            if (bt === blockTitle && type === 'chunk' && textChunk !== undefined) {
                callback(textChunk);
            } else if (bt === blockTitle && type === 'end') {
                callback(null); // Signify end of stream
                ipcRenderer.removeListener('digest', digestChunkHandler);
            } else if (bt === blockTitle && type === 'error') {
                console.error('Digest error:', error);
                callback(null);
                ipcRenderer.removeListener('digest', digestChunkHandler);
            }
        };
        ipcRenderer.on('digest', digestChunkHandler);
        ipcRenderer.send('generate_digest', blockTitle);

        return () => {
            ipcRenderer.removeListener('digest', digestChunkHandler);
        };
    },
    getDigestItems: (itemIds: number[]) => ipcRenderer.invoke('get_digest_items', itemIds),
    validateRssFeed: (url: string) => ipcRenderer.invoke('validate_rss_feed', url),
    discoverRssFeeds: (url: string) => ipcRenderer.invoke('discover_rss_feeds', url),
    addRssSource: (source: {
        name: string;
        urls: string[];
        defaultValues?: {
            item_type?: 'Article' | 'Link';
            lang_id?: string;
            summarizable?: boolean;
        };
    }) => ipcRenderer.invoke('add_rss_source', source),
    addQuery: (query: any, createFeed: boolean = true) => ipcRenderer.invoke('add_query', query, createFeed),
    getAvailableSources: () => ipcRenderer.invoke('get_available_sources'),
    getAvailableFilters: () => ipcRenderer.invoke('get_available_filters'),
    getAvailableBlocks: () => ipcRenderer.invoke('get_available_blocks'),
    addDigest: (block: any) => ipcRenderer.invoke('add_digest', block),
    addFeed: (feed: any) => ipcRenderer.invoke('add_feed', feed)
});

/** This sets up the API used in src/bridge/loading_items_to_feed/electron/frontend.ts */
contextBridge.exposeInMainWorld('feedAPI', {
    sendRequest: (request: FrontendRequest, instructions?: Instructions) => ipcRenderer.invoke('feedAPI', { request: request, instructions: instructions }),
})

/** Electron's IPC allows the above to be accessed as methods of the window object, so we need to declare this to avoid type errors. */
declare global {
    interface Window {
        electronAPI: {
            itemUpdate: (request: Prisma.ItemUpdateArgs) => Promise<void>,
            getSummary: (item_id: number, callback: (chunk: string | null) => void) => Promise<() => void>,
            refreshFeeds: () => Promise<void>,
            getFeedData: () => Promise<Feed[]>,
            getRawConfig: () => Promise<string>,
            generateDigest: (blockTitle: string, callback: (chunk: string | null) => void) => () => void,
            getDigestItems: (itemIds: number[]) => Promise<DigestDisplayItem[]>,
            validateRssFeed: (url: string) => Promise<{ valid: boolean; title?: string; itemCount?: number; error?: string }>,
            discoverRssFeeds: (url: string) => Promise<{ feeds: Array<{ url: string; title?: string }>; error?: string }>,
            addRssSource: (source: { name: string; urls: string[]; defaultValues?: { item_type?: 'Article' | 'Link'; lang_id?: string; summarizable?: boolean } }) => Promise<{ success: boolean; error?: string }>,
            addQuery: (query: any, createFeed?: boolean) => Promise<{ success: boolean; error?: string }>,
            getAvailableSources: () => Promise<string[]>,
            getAvailableFilters: () => Promise<Array<{ title: string; implementation: string }>>,
            getAvailableBlocks: () => Promise<Array<{ title: string; implementation: string }>>,
            addDigest: (block: any) => Promise<{ success: boolean; error?: string }>,
            addFeed: (feed: any) => Promise<{ success: boolean; error?: string }>
        },
        feedAPI: {
            sendRequest<T extends BackendResponse>(request: FrontendRequest, instructions?: Instructions): Promise<T>,
        }
    }
}
