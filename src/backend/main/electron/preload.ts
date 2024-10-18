import { contextBridge, ipcRenderer } from 'electron';
import type { Feed } from '$lib/types';
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
    getRawConfig: () => ipcRenderer.invoke('get_raw_config')
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
            getRawConfig: () => Promise<string>
        },
        feedAPI: {
            sendRequest<T extends BackendResponse>(request: FrontendRequest, instructions?: Instructions): Promise<T>,
        }
    }
}
