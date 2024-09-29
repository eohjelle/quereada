import { StreamFrontend } from './frontend';
import { StreamSocket } from './web/frontend';
import { ElectronStreamFrontend } from './electron/frontend';
import type { Instructions } from './types';

export function getStream(instructions: Instructions) {
    console.log(`MODE: ${import.meta.env.MODE}`);
    let streamFrontend: StreamFrontend;
    if (import.meta.env.MODE === 'web') {
        streamFrontend = new StreamSocket(instructions);
    } else if (import.meta.env.MODE === 'electron') {
        streamFrontend = new ElectronStreamFrontend(instructions);
    } else {
        throw new Error('Environmental variable RUNTIME_ENV must be set to "web" or "electron".');
    }
    return streamFrontend;
}