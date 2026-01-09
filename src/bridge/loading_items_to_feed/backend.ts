import { ItemsIterator } from '$root/modules/blocks/items_iterator';
import type { Instructions } from './types';


// A request to get an item should call itemsReader.read() and return the value.
export abstract class StreamBackend<T = any> {
    protected stream: Map<T, ItemsIterator>;
    protected reader: Map<T, ReadableStreamDefaultReader>;
    protected operationQueue: Map<T, Promise<any>>;

    constructor() {
        this.stream = new Map();
        this.reader = new Map();
        this.operationQueue = new Map();
    }

    // In the subclass, the constructor also sets up listeners to handle three types of requests:
    // - initializing a new client connection (should call the initClient method)
    // - closing the client connection (should call the closeClient method)
    // - requesting the next item (should call the nextItem method)

    private async enqueueOperation(client: T, operation: () => Promise<any>): Promise<any> {
        const currentPromise = this.operationQueue.get(client) || Promise.resolve();
        const newPromise = currentPromise.then(operation);
        this.operationQueue.set(client, newPromise);
        return newPromise;
    }

    protected async initClient(client: T, instructions: Instructions): Promise<void> {
        return this.enqueueOperation(client, async () => {
            console.log(`Initializing stream for client with instructions`, instructions);
            const itemsIterator = new ItemsIterator(instructions);
            this.stream.set(client, itemsIterator);
            this.reader.set(client, itemsIterator.stream.getReader());
            console.log(`Stream for client initialized.`);
        });
    }

    protected async closeClient(client: T): Promise<void> {
        return this.enqueueOperation(client, async () => {
            console.log(`Closing stream for client...`);
            const reader = this.reader.get(client);
            if (reader) {
                await reader.cancel();
                this.reader.delete(client);
            }
            this.stream.delete(client);
            console.log(`Stream for client closed.`);
        });
    }

    protected async nextItem(client: T): Promise<{ done: boolean; item: any }> {
        return this.enqueueOperation(client, async () => {
            const reader = this.reader.get(client);
            if (!reader) {
                console.error(`Client does not have a reader.`);
                return { done: true, item: null };
            }
            const { done, value } = await reader.read();
            if (done) {
                this.closeClient(client);
            }
            return { done, item: value };
        });
    }
}
