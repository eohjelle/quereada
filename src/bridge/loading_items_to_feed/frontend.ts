import type { Chunk, Instructions, FrontendStatus, BackendStatus } from './types';

export abstract class StreamFrontend {
    stream: ReadableStream; 
    protected instructions: Instructions;
    protected abstract connectionPromise: Promise<void>;
    
    constructor(instructions: Instructions) {
        this.instructions = instructions;
        this.stream = this.initStream();
    }

    protected abstract sendStatus(status: FrontendStatus): void;

    // todo: decide if I want to keep these instructions related functions
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
                console.log('Connection established.');
                await this.waitForStatus("start"); // Make sure that the connection is established before trying to send or receive other messages
                console.log('Backend is ready to send items.');
            },
            pull: async (controller) => {
                try {
                    const chunkPromise = this.waitForChunk();
                    this.sendStatus("ready");
                    const chunk = await chunkPromise;
                    controller.enqueue(chunk);
                    console.log('Chunk received:', chunk.id);
                } catch (error) {
                    console.log("Closing stream.");
                    controller.close();
                }
            }
        });
    }

    abstract close(): void;
}