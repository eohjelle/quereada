import { StreamBackend } from '../backend';
import type { FrontendStatus, BackendStatus, Chunk, Instructions } from '../types';
import { ipcMain } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent, WebContents } from 'electron';

// The class which controls the IPC communication in the Electron backend
export class ElectronStreamBackend extends StreamBackend<WebContents> {
    constructor() {
        super();
        
        ipcMain.handle('connection', (event: IpcMainInvokeEvent, message: { status: FrontendStatus, instructions: Instructions }) => {
            // console.log(`Received message from client: { status: ${message.status}, instructions: ${message.instructions} }`);
            if (message.status === 'start') {
                this.initClient(event.sender, message.instructions);
                return 'Connection successful!';
            } else if (message.status === 'close') {
                this.closeClient(event.sender);
                return 'Connection closed!';
            }
        });

        ipcMain.on('instructions', (event: IpcMainEvent, instructions: Instructions) => {
            this.setInstructions(event.sender, instructions);
        });
    }

    sendChunk(client: WebContents, chunk: Chunk) {
        client.send('stream', chunk);
    }

    sendStatus(client: WebContents, status: BackendStatus): void {
        client.send('status', status);
    }

    waitForStatus(client: WebContents, status: FrontendStatus): Promise<void> {
        return new Promise<void>((resolve) => {
            function messageHandler(event: IpcMainEvent, frontendStatus: FrontendStatus) {
                if (frontendStatus === status && event.sender === client) {
                    ipcMain.removeListener('status', messageHandler);
                    resolve();
                }
            }
            ipcMain.on('status', messageHandler);
        });
    }
}

