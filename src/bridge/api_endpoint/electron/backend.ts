import { EndpointBackend } from "../backend";
import type { Prisma } from "@prisma/client";
import { ipcMain, type IpcMainInvokeEvent } from "electron";

export class ElectronEndpointBackend extends EndpointBackend {
    constructor() {
        super();

        console.log('ElectronEndpointBackend constructor');

        ipcMain.handle('update_item', async (event: IpcMainInvokeEvent, query: Prisma.ItemUpdateArgs) => {
            try {
                await this.itemUpdate(query);
                return { message: 'Item updated successfully' };
            } catch (error) {
                console.error('Error updating item:', error);
                return { error: 'Internal server error' };
            }
        });

        ipcMain.on('get_summary', async (event: IpcMainInvokeEvent, item_id: number) => {
            try {
                console.log('Received request to get summary for item:', item_id);
                const summaryStream = await this.getSummary(item_id);
                summaryStream.pipeTo(new WritableStream({
                    write(chunk) {
                        event.sender.send('summary', { id: item_id, type: 'chunk', textChunk: chunk });
                    },
                    close() {
                        event.sender.send('summary', { id: item_id, type: 'end' });
                    }
                }));
            } catch (error) {
                console.error('Could not send summary from main process to renderer process.', error);
                return { error: `Request to get summary for item ${item_id} led to error in the main process. Inspect the logs for more information.` };
            }
        });

        ipcMain.handle('refresh_feeds', async () => {
            try {
                await this.refreshFeeds();
                return { message: 'Feeds refreshed successfully' };
            } catch (error) {
                console.error('Error refreshing feeds:', error);
                return { error: 'Internal server error' };
            }
        });

        ipcMain.handle('get_feed_data', async () => {
            try {
                const feedData = await this.getFeedData();
                return feedData;
            } catch (error) {
                console.error('Error getting feed data:', error);
                return { error: 'Internal server error' };
            }
        });

        ipcMain.handle('get_raw_config', async () => {
            try {
                const rawConfig = await this.getRawConfig();
                return rawConfig;
            } catch (error) {
                console.error('Error getting raw config:', error);
                return { error: 'Internal server error' };
            }
        });

        ipcMain.on('generate_digest', async (event: IpcMainInvokeEvent, blockTitle: string) => {
            try {
                console.log('Received request to generate digest for block:', blockTitle);
                const digestStream = await this.generateDigest(blockTitle);
                digestStream.pipeTo(new WritableStream({
                    write(chunk) {
                        event.sender.send('digest', { blockTitle, type: 'chunk', textChunk: chunk });
                    },
                    close() {
                        event.sender.send('digest', { blockTitle, type: 'end' });
                    }
                }));
            } catch (error) {
                console.error('Could not send digest from main process to renderer process.', error);
                event.sender.send('digest', { blockTitle, type: 'error', error: String(error) });
            }
        });

        ipcMain.handle('get_digest_items', async (event: IpcMainInvokeEvent, itemIds: number[]) => {
            try {
                const items = await this.getDigestItems(itemIds);
                return items;
            } catch (error) {
                console.error('Error getting digest items:', error);
                return { error: 'Internal server error' };
            }
        });
    }
}