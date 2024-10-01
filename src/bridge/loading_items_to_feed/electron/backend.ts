import { StreamBackend } from '../backend';
import type { FrontendRequest, BackendResponse, Chunk, Instructions } from '../types';
import { ipcMain } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent, WebContents } from 'electron';

// The class which controls the IPC communication in the Electron backend
export class ElectronStreamBackend extends StreamBackend<WebContents> {
    constructor() {
        super();
        
        ipcMain.handle('feedAPI', (event: IpcMainInvokeEvent, message:{ request: FrontendRequest, instructions?: Instructions }) => {
            if (message.request === 'start') {
                this.initClient(event.sender, message.instructions!);
                return 'Stream initialized!';
            } else if (message.request === 'close') {
                this.closeClient(event.sender);
                return 'Stream closed!';
            } else if (message.request === 'next') {
                return this.nextItem(event.sender);
            }
        });
    }
}

