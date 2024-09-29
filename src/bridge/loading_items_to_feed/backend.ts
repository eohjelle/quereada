import { ItemsStream } from '$src/backend/items_stream';
import type { FrontendStatus, BackendStatus, Chunk, Instructions } from './types';

export abstract class StreamBackend<T = any> {
    protected clientItemsStream: Map<T, ItemsStream>;
    protected clientStreams: Map<T, WritableStream>;
    protected clientReady: Map<T, Promise<any>>;
    protected clientUntilReadyCheck: Map<T, number>;
    protected clientInstructions: Map<T, Instructions>;

    constructor() {
        this.clientItemsStream = new Map();
        this.clientStreams = new Map();
        this.clientReady = new Map();
        this.clientUntilReadyCheck = new Map();
        this.clientInstructions = new Map();
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
                await this.clientReady.get(client);
                this.sendChunk(client, chunk);

                this.clientUntilReadyCheck.set(client, this.clientUntilReadyCheck.get(client)! - 1);
                if (this.clientUntilReadyCheck.get(client)! === 0) {
                    this.clientReady.set(client, this.waitForStatus(client, 'ready'));
                    this.clientUntilReadyCheck.set(client, this.clientInstructions.get(client)!.pageSize);
                }
            },
            close: () => {
                console.log('Client stream closing, so closing client connection...');
                this.closeClient(client);
            }
        });
    }

    protected initClient(client: T, instructions: Instructions) {
        console.log('Initializing client with instructions', instructions);
        this.clientInstructions.set(client, instructions);
        this.clientUntilReadyCheck.set(client, instructions.pageSize);
        this.clientReady.set(client, this.waitForStatus(client, 'ready'));
        this.clientStreams.set(client, this.createClientStream(client));
        this.clientItemsStream.set(client, new ItemsStream(instructions));
        this.clientItemsStream.get(client)!.stream.pipeTo(this.clientStreams.get(client)!);
        this.sendStatus(client, 'start');
    }

    protected closeClient(client: T) {
        console.log('Closing client connection...');
        this.clientStreams.delete(client);
        this.clientReady.delete(client);
        this.clientUntilReadyCheck.delete(client);
        this.clientInstructions.delete(client);
        this.clientItemsStream.delete(client);
    }

    protected setInstructions(client: T, instructions: Instructions) {
        // console.log(`Setting instructions:`, instructions);
        this.clientInstructions.set(client, instructions);
        this.clientItemsStream.get(client)!.setInstructions(instructions);
    }
}