import { StreamInterface } from '../frontend';
import type { Instructions, FrontendRequest, BackendResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WebStreamInterface extends StreamInterface {
    private socket: WebSocket;
    protected connectionPromise: Promise<void>;
    isConnected: boolean = false;

    constructor() {
        super();
        let resolveConnection: () => void;
        this.connectionPromise = new Promise((resolve) => {
            resolveConnection = resolve;
        });

        // Initialize the WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        this.socket = new WebSocket(`${protocol}://${host}`);

        // Log errors
        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    
        // Send a message to start the stream when the connection is open
        this.socket.onopen = async () => {
            console.log("Connected to WebSocket server.");
            resolveConnection();
            this.isConnected = true;
        };

        this.socket.onclose = (event) => {
            console.log("WebSocket connection closed:", event.reason);
            this.isConnected = false;
        };
    }

    protected async sendRequest<T extends BackendResponse>(request: FrontendRequest, instructions?: Instructions): Promise<T> {
        console.log('Sending request:', request);
        const id = uuidv4();
        const promise = new Promise((resolve, reject) => {
            const callback = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.id === id) {
                    this.socket.removeEventListener('message', callback);
                    if (data.type === 'json') {
                        resolve(data.data);
                    } else if (data.type === 'string') {
                        resolve(data.data);
                    } else {
                        reject(new Error('Unexpected message type received'));
                    }
                }
            }
            this.socket.addEventListener('message', callback);
        });
        this.socket.send(JSON.stringify({ request: request, instructions: instructions, id: id }));
        return promise as Promise<T>;
    }
}