import { StreamInterface } from '../frontend';
import type { Instructions, Chunk, FrontendRequest, BackendResponse } from '../types';

// The class which controls the IPC communication in the Electron frontend.
// The streamAPI is defined in the preload script (see ./src/main/electron/preload.js)
export class ElectronStreamInterface extends StreamInterface {
    protected connectionPromise: Promise<void>;

    constructor() {
        super();
        this.connectionPromise = Promise.resolve();
    }

    protected async sendRequest<T extends BackendResponse>(request: FrontendRequest, instructions?: Instructions): Promise<T> {
        return window.feedAPI.sendRequest(request, instructions);
    }
}