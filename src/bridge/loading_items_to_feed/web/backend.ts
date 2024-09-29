import { StreamBackend } from '../backend';
import type { BackendStatus, FrontendStatus, Chunk, Instructions } from '../types';
import { WebSocket, WebSocketServer } from 'ws';
import type { MessageEvent } from 'ws';
import { Server } from 'http';

// A WebSocket server that can stream a ReadableStream to the client
// This is called in webserver.ts
export class StreamSocketServer extends StreamBackend<WebSocket> {
    private wss: WebSocketServer;

    constructor(server: Server) {
        super();

        this.wss = new WebSocketServer({ server });

        this.wss.on('connection', (ws) => {
            console.log('Client connected');
            
            // Handle messages from the client
            ws.on('message', (message: MessageEvent) => {
                console.log('Received:', message.toString());
                const parsedMessage: { status?: FrontendStatus, instructions?: Instructions } = JSON.parse(message.toString());
                if (parsedMessage.status) {
                    if (parsedMessage.status === 'start') {
                        this.initClient(ws, parsedMessage.instructions!);
                    } else if (parsedMessage.status === 'close') {
                        ws.close();
                    }
                } else if (parsedMessage.instructions) {
                    this.setInstructions(ws, parsedMessage.instructions);
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                console.log('Client disconnected');
                this.closeClient(ws);
            });
        });
    }

    sendChunk(ws: WebSocket, chunk: Chunk) {
        ws.send(JSON.stringify({ status: 'chunk', chunk: chunk }));
    }

    sendStatus(ws: WebSocket, status: BackendStatus) {
        ws.send(JSON.stringify({ status: status }));
    }

    // Create a promise that resolves when the client sends a message with the specified status
    waitForStatus(ws: WebSocket, statusToWaitFor: FrontendStatus) {
        return new Promise<void>((resolve) => {
            function messageHandler(message: MessageEvent) {
                const messageParsed = JSON.parse(message.data.toString());
                if (messageParsed.status === statusToWaitFor) {
                    ws.removeEventListener('message', messageHandler);
                    resolve(messageParsed);
                }
            }
            ws.addEventListener('message', messageHandler);
        });
    }
}
