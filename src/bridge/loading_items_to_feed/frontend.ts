import type { Chunk, Instructions, FrontendRequest, BackendResponse } from './types';

export abstract class StreamInterface {
    stream!: ReadableStream;
    protected abstract connectionPromise: Promise<void>; // Resolves when the connection is established.

    protected abstract sendRequest<T extends BackendResponse>(request: FrontendRequest, instructions?: Instructions): Promise<T>;

    async start(instructions: Instructions): Promise<string> {
        this.stream = this.initStream();
        return await this.sendRequest<string>('start', instructions);
    }

    async close(): Promise<string> {
        return await this.sendRequest<string>('close');
    }

    protected async nextItem(): Promise<{ done: boolean, item: Chunk }> {
        return await this.sendRequest<{ done: boolean, item: Chunk }>('next');
    }

    // Initialize the stream.
    protected initStream() {
        return new ReadableStream({
            start: async () => {
                await this.connectionPromise; // Wait for the connection to be established
            },
            pull: async (controller) => {
                try {
                    const { done, item } = await this.nextItem();
                    if (done) {
                        controller.close();
                    } else {
                        controller.enqueue(item);
                        console.log('Chunk received:', item.id);
                    }
                } catch (error) {
                    console.error("Error in stream:", error);
                }
            }
        });
    }
}