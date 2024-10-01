import { StreamBackend } from '../backend';
import type { Instructions, FrontendRequest } from '../types';
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
            console.log('Client connected.');
            
            // Handle messages from the client
            ws.on('message', async (message: MessageEvent) => {
                console.log('Received request:', message.toString());
                const parsedMessage: { request: FrontendRequest, instructions?: Instructions, id: string } = JSON.parse(message.toString());
                if (parsedMessage.request === 'start') {
                    this.initClient(ws, parsedMessage.instructions!);
                    ws.send(JSON.stringify({ type: 'string', data: 'Server: Initialized items stream.', id: parsedMessage.id }));
                } else if (parsedMessage.request === 'close') {
                    await this.closeClient(ws);
                    ws.send(JSON.stringify({ type: 'string', data: 'Server: Closed items stream.', id: parsedMessage.id }));
                } else if (parsedMessage.request === 'next') {
                    const { done, item } = await this.nextItem(ws);
                    ws.send(JSON.stringify({ type: 'json', data: { done, item }, id: parsedMessage.id }));
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                console.log('Client disconnected.');
                this.closeClient(ws);
            });
        });
    }
}
