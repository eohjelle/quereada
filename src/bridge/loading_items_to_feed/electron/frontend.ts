import { StreamFrontend } from '../frontend';
import type { FrontendStatus, BackendStatus, Instructions, Chunk } from '../types';
import type { IpcRendererEvent } from 'electron';


// The Electron IPC allows the streamAPI to be accessed as a method of the window object, so we need to declare this to avoid type errors.
declare global {
    interface Window {
        streamAPI: { 
            sendStatus: (status: FrontendStatus) => void,
            sendInstructions: (instructions: Instructions) => void,
            waitForChunk: () => Promise<Chunk>,
            waitForStatus: (status: BackendStatus) => Promise<void>,
            connection: (message: { status: FrontendStatus, instructions: Instructions }) => Promise<string>
        };
    }
}

// The class which controls the IPC communication in the Electron frontend.
// The streamAPI is defined in the preload script (see ./src/main/electron/preload.js)
export class ElectronStreamFrontend extends StreamFrontend {
    protected connectionPromise: Promise<void>;

    constructor(instructions: Instructions) {
        super(instructions);
        this.connectionPromise = new Promise<void>((resolve) => {
            window.streamAPI.connection({ status: "start", instructions: this.instructions }).then((message) => {
                console.log(message);
                resolve();
            });
        });
    }

    sendStatus(status: FrontendStatus) {
        window.streamAPI.sendStatus(status);
    }

    sendInstructions() {
        window.streamAPI.sendInstructions(this.instructions);
    }

    async waitForChunk(): Promise<Chunk> {
        return window.streamAPI.waitForChunk();
    }

    async waitForStatus(status: BackendStatus): Promise<void> {
        return window.streamAPI.waitForStatus(status);
    }
}