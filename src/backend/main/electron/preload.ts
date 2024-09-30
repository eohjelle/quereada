import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { Feed } from '$lib/types';
import type { Prisma } from '@prisma/client';
import type { FrontendStatus, BackendStatus, Instructions, Chunk } from '$bridge/loading_items_to_feed/types';

/** This sets up the API used in src/bridge/api_endpoint/electron/frontend.ts */
contextBridge.exposeInMainWorld('electronAPI', {
    itemUpdate: (request: Prisma.ItemUpdateArgs) => ipcRenderer.invoke('update_item', request),
    getSummary: (item_id: number) => ipcRenderer.invoke('get_summary', item_id),
    refreshFeeds: () => ipcRenderer.invoke('refresh_feeds'),
    getFeedData: () => ipcRenderer.invoke('get_feed_data'),
    getRawConfig: () => ipcRenderer.invoke('get_raw_config')
});

/** This sets up the API used in src/bridge/loading_items_to_feed/electron/frontend.ts */
contextBridge.exposeInMainWorld('feedAPI', {
    connection: (message: { status: FrontendStatus, instructions: Instructions }) => ipcRenderer.invoke('connection', message),
    sendStatus: (status: FrontendStatus) => ipcRenderer.send('status', status),
    waitForChunk: () => new Promise<Chunk>((resolve) => {
        const callback = (event: IpcRendererEvent, chunk: Chunk) => resolve(chunk);
        ipcRenderer.once('stream', callback);
    }),
    waitForStatus: (status: BackendStatus) => new Promise<void>((resolve) => {
        const callback = (event: IpcRendererEvent, backendStatus: BackendStatus) => {
            if (backendStatus === status) {
                resolve();
            }
        }
        ipcRenderer.once('status', callback);
    })
})

/** Electron's IPC allows the above to be accessed as methods of the window object, so we need to declare this to avoid type errors. */
declare global {
    interface Window {
        electronAPI: { 
            itemUpdate: (request: Prisma.ItemUpdateArgs) => Promise<void>,
            getSummary: (item_id: number) => Promise<ReadableStream<string>>,
            refreshFeeds: () => Promise<void>,
            getFeedData: () => Promise<Feed[]>,
            getRawConfig: () => Promise<string>
        },
        feedAPI: {
            connection: (message: { status: FrontendStatus, instructions: Instructions }) => Promise<string>,
            sendStatus: (status: FrontendStatus) => void,
            waitForChunk: () => Promise<Chunk>,
            waitForStatus: (status: BackendStatus) => Promise<void>
        }
    }
}