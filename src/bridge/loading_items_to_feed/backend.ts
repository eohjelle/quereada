import { ItemsStream } from '$src/backend/items_stream';
import type { Instructions } from './types';


// todo: simplifiy this class. Only need two properties: itemsStream and itemsReader. 
// A request to get an item should call itemsReader.read() and return the value. 
export abstract class StreamBackend<T = any> {
    protected stream: Map<T, ItemsStream>;
    protected reader: Map<T, ReadableStreamDefaultReader>;

    constructor() {
        this.stream = new Map();
        this.reader = new Map();
    }

    // In the subclass, the constructor also sets up listeners to handle three types of requests:
    // - initializing a new client connection (should call the initClient method)
    // - closing the client connection (should call the closeClient method)
    // - requesting the next item (should call the nextItem method)

    protected initClient(client: T, instructions: Instructions) {
        console.log('Initializing client with instructions', instructions);
        const stream = new ItemsStream(instructions);
        this.stream.set(client, stream);
        this.reader.set(client, stream.stream.getReader());
    }

    protected async closeClient(client: T) {
        console.log('Closing client connection...');
        await this.reader.get(client)?.cancel();
        this.reader.delete(client);
        this.stream.delete(client);
    }

    protected async nextItem(client: T) {
        const reader = this.reader.get(client);
        if (!reader) {
            throw new Error('Client does not have a reader.');
        }
        const { done, value } = await reader.read();
        if (done) {
            await this.closeClient(client);
        }
        return { done, item: value };
    }
}