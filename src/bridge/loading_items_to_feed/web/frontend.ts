import { StreamFrontend } from '../frontend';
import type { FrontendStatus, BackendStatus, Chunk, Instructions } from '../types';

export class StreamSocket extends StreamFrontend {
    private socket: WebSocket;
    protected connectionPromise: Promise<void>;
    private resolveConnection!: () => void;

    constructor(instructions: Instructions) {
        super(instructions);
        this.connectionPromise = new Promise((resolve) => {
            this.resolveConnection = resolve;
        });

        // Initialize the WebSocket connection
        this.socket = new WebSocket(`ws://${window.location.host}`);

        // Log errors
        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    
        // Send a message to start the stream when the connection is open
        this.socket.onopen = () => {
            console.log("Connected to WebSocket server.");
            this.socket.send(JSON.stringify({ status: 'start', instructions: this.instructions }));
            this.resolveConnection();
        };

        this.socket.onclose = (event) => {
            console.log("WebSocket connection closed:", event.reason);
        };
    }

    sendStatus(status: FrontendStatus) {
        // console.log(`Sending status: ${status}`);
        this.socket.send(JSON.stringify({ status: status }));
    }

    sendInstructions() {
        this.socket.send(JSON.stringify({ instructions: this.instructions }));
    }
    
    async waitForChunk(): Promise<Chunk> {
        return new Promise((resolve, reject) => {
            const messageHandler = (event: MessageEvent) => {
                if (JSON.parse(event.data).status === 'chunk') {
                    this.socket.removeEventListener('message', messageHandler);
                    const chunk = JSON.parse(event.data).chunk;
                    resolve(chunk);
                }
            }
            this.socket.addEventListener('message', messageHandler);
        });
    }

    async waitForStatus(status: BackendStatus) {
        return new Promise<void>((resolve, reject) => {
            console.log('Waiting for status:', status);
            const messageHandler = (event: MessageEvent) => {
                if (JSON.parse(event.data).status === status) {
                    this.socket.removeEventListener('message', messageHandler);
                    resolve();
                }
            }
            this.socket.addEventListener('message', messageHandler);
        });
    }
}