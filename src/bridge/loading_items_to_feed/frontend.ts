import type { Chunk, Instructions, FrontendStatus, BackendStatus } from './types';

export abstract class StreamFrontend {
    stream: ReadableStream; 
    protected instructions: Instructions;
    protected abstract connectionPromise: Promise<void>;
    protected batchSize: number = 10;
    
    constructor(instructions: Instructions) {
        this.instructions = instructions;
        this.batchSize = instructions.pageSize;
        this.stream = this.initStream();
    }

    protected abstract sendStatus(status: FrontendStatus): void;

    protected abstract sendInstructions(): void;

    setInstructions(instructions: Instructions): void {
        console.log(`Setting instructions:`, instructions);
        this.instructions = instructions;
        this.sendInstructions();
    }

    protected abstract waitForChunk(): Promise<Chunk>;

    protected abstract waitForStatus(status: BackendStatus): Promise<void>;

    // Initialize the stream.
    protected initStream() {
        return new ReadableStream({
            start: async (controller) => {
                await this.connectionPromise; // Wait for the connection to be established
                console.log('Connection established');
                await this.waitForStatus("start"); // Make sure that the connection is established before trying to send or receive other messages
                console.log('Received start message');
            },
            pull: async (controller) => {
                this.sendStatus("ready");
                for (let i = 0; i < this.batchSize; i++) {
                    const chunk = await this.waitForChunk();
                    controller.enqueue(chunk);
                }
            }
        });
    }
}


// todo: close connection when the stream is closed