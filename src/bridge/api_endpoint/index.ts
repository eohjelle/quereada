import { EndpointFrontend } from './frontend';
import { WebEndpointFrontend } from './web/frontend';

function getEndpoint() {
    let streamFrontend: EndpointFrontend;
    if (import.meta.env.MODE === 'web') {
        streamFrontend = new WebEndpointFrontend();
    } else if (import.meta.env.MODE === 'electron') {
        throw new Error('todo: Endpoint not yet implemented for Electron.')
    } else {
        throw new Error('Environmental variable MODE (todo: check if this is correct name) must be set to "web" or "electron".');
    }
    return streamFrontend;
}


export const api = getEndpoint();
