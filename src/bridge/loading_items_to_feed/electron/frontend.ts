import { StreamFrontend } from '../frontend';
import type { FrontendStatus, BackendStatus, Instructions, Chunk } from '../types';

// The class which controls the IPC communication in the Electron frontend.
// The streamAPI is defined in the preload script (see ./src/main/electron/preload.js)
export class ElectronStreamFrontend extends StreamFrontend {
    protected connectionPromise: Promise<void>;

    constructor(instructions: Instructions) {
        super();
        this.connectionPromise = new Promise<void>((resolve) => {
            window.feedAPI.connection({ status: "start", instructions: instructions }).then((message) => {
                console.log(message);
                resolve();
            });
        });
    }

    sendStatus(status: FrontendStatus) {
        window.feedAPI.sendStatus(status);
    }

    async waitForChunk(): Promise<Chunk> {
        return window.feedAPI.waitForChunk();
    }

    async waitForStatus(status: BackendStatus): Promise<void> {
        return window.feedAPI.waitForStatus(status);
    }

    close() {
        window.feedAPI.sendStatus('close');
    }
}