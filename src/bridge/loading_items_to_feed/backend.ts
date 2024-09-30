import { ItemsStream } from '$src/backend/items_stream';
import type { FrontendStatus, BackendStatus, Chunk, Instructions } from './types';


// todo: simplifiy this class. Only need two properties: itemsStream and itemsReader. 
// A request to get an item should call itemsReader.read() and return the value. 
export abstract class StreamBackend<T = any> {
    protected clientItemsStream: Map<T, ItemsStream>;
    protected clientStreams: Map<T, WritableStream>;
    protected clientReady: Map<T, Promise<any>>;

    constructor() {
        this.clientItemsStream = new Map();
        this.clientStreams = new Map();
        this.clientReady = new Map();
    }

    // In the subclass, the constructor also sets up listeners to handle three types of messages:
    // - initializing a new client connection (should call the initClient method)
    // - updating the instructions of the client (should call the setInstructions method)
    // - closing the client connection (should call the closeClient method)

    abstract sendChunk(client: T, chunk: Chunk): void;

    abstract sendStatus(client: T, status: BackendStatus): void;

    abstract waitForStatus(client: T, status: FrontendStatus): Promise<void>;

    private createClientStream(client: T): WritableStream {
        return new WritableStream({
            write: async (chunk) => {
                console.log('Waiting for client to be ready...');
                await this.clientReady.get(client);
                this.clientReady.set(client, this.waitForStatus(client, 'ready'));
                console.log('Client is ready, sending item: ', chunk.id);
                this.sendChunk(client, chunk);
            },
            close: async () => {
                await this.clientReady.get(client);
                this.sendStatus(client, 'close');
            }
        });
    }

    protected initClient(client: T, instructions: Instructions) {
        console.log('Initializing client with instructions', instructions);
        this.clientReady.set(client, this.waitForStatus(client, 'ready'));
        this.clientStreams.set(client, this.createClientStream(client));

        this.clientItemsStream.set(client, new ItemsStream(instructions));
        this.clientItemsStream.get(client)!.stream.pipeTo(this.clientStreams.get(client)!).then(() => {
            this.closeClient(client);
        });
        this.sendStatus(client, 'start');
    }

    protected closeClient(client: T) {
        console.log('Closing client connection...');
        this.clientStreams.delete(client);
        this.clientReady.delete(client);
        this.clientItemsStream.delete(client);
    }
}