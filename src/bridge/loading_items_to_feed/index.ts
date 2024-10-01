import { StreamInterface } from './frontend';
import { WebStreamInterface } from './web/frontend';
import { ElectronStreamInterface } from './electron/frontend';

export function getStreamInterface() {
    let streamFrontend: StreamInterface;
    if (import.meta.env.MODE === 'web') {
        streamFrontend = new WebStreamInterface();
    } else if (import.meta.env.MODE === 'electron') {
        streamFrontend = new ElectronStreamInterface();
    } else {
        throw new Error('vite build must run with parameter --mode set to "web" or "electron".');
    }
    return streamFrontend;
}

export type { StreamInterface };
