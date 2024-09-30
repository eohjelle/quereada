import { EndpointFrontend } from './frontend';
import { WebEndpointFrontend } from './web/frontend';
import { ElectronEndpointFrontend } from './electron/frontend';

function getEndpoint() {
    let streamFrontend: EndpointFrontend;
    if (import.meta.env.MODE === 'web') {
        streamFrontend = new WebEndpointFrontend();
    } else if (import.meta.env.MODE === 'electron') {
        streamFrontend = new ElectronEndpointFrontend();
    } else {
        throw new Error('vite build must run with parameter --mode set to "web" or "electron".');
    }
    return streamFrontend;
}


export const api = getEndpoint();
