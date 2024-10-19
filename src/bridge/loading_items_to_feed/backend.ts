import { ItemsStream } from '$src/backend/items_stream';
import type { Instructions } from './types';


// todo: simplifiy this class. Only need two properties: itemsStream and itemsReader. 
// A request to get an item should call itemsReader.read() and return the value. 
export abstract class StreamBackend<T = any> {
    protected stream: Map<T, ItemsStream>;
    protected reader: Map<T, ReadableStreamDefaultReader>;
    protected lock: Map<T, Promise<void>>; // A lock that prevents a user from initializing a new stream while the previous stream is not closed
    protected key: Map<T, () => void>; // A key that unlocks the lock
    protected initializing: Map<T, Promise<void>>; // A promise that resolves when the client is initialized

    constructor() {
        this.stream = new Map();
        this.reader = new Map();
        this.lock = new Map();
        this.key = new Map();
        this.initializing = new Map();
    }

    // In the subclass, the constructor also sets up listeners to handle three types of requests:
    // - initializing a new client connection (should call the initClient method)
    // - closing the client connection (should call the closeClient method)
    // - requesting the next item (should call the nextItem method)

    protected async initClient(client: T, instructions: Instructions) {
        let initialized!: () => void;
        this.initializing.set(client, new Promise(resolve => {
            initialized = resolve;
        }));
        console.log('Initializing client stream with instructions', instructions);
        const stream = new ItemsStream(instructions);
        if (this.lock.has(client)) {
            console.log('Client already has a stream in progress. Waiting for it to finish...');
            await this.lock.get(client);
        }
        this.lock.set(client, new Promise(resolve => {
            this.key.set(client, resolve);
        }));
        this.stream.set(client, stream);
        this.reader.set(client, stream.stream.getReader());
        initialized();
    }

    protected async closeClient(client: T) {
        console.log('Closing client stream...');
        await this.reader.get(client)?.cancel();
        this.reader.delete(client);
        this.stream.delete(client);
        const key = this.key.get(client);
        this.key.delete(client);
        this.lock.delete(client);
        this.initializing.delete(client);
        if (key) {
            key();
        }
    }

    protected async nextItem(client: T) {
        // Make sure the client is initialized before getting the next item
        if (!this.initializing.has(client)) {
            console.error('Calling nextItem before client is initialized.');
            return { done: true, item: null };
        }
        await this.initializing.get(client);
        const reader = this.reader.get(client);
        if (!reader) {
            console.error('Client does not have a reader. Closing stream.');
            return { done: true, item: null };
        }
        const { done, value } = await reader.read();
        if (done) {
            await this.closeClient(client);
        }
        return { done, item: value };
    }
}