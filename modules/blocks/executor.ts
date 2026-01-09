import { db } from '$src/backend/database';
import type { Block } from '$lib/types';
import type { BlockOutput } from './types';
import { ItemsIterator } from './items_iterator';
import { digesters } from './digesters';

/**
 * BlockExecutor handles execution of blocks, including chaining.
 *
 * Key principles:
 * - All item queries go through ItemsIterator (for proper filtering/pagination)
 * - Digesters receive an array of BlockOutputs from their input_blocks
 * - Supports chaining: digester output can feed another digester
 */
export class BlockExecutor {
    private outputCache: Map<string, BlockOutput> = new Map();
    private feedTitle: string;

    constructor(feedTitle: string = '') {
        this.feedTitle = feedTitle;
    }

    /**
     * Execute a block and return its output.
     *
     * @param blockTitle - The title of the block to execute
     * @returns BlockOutput containing the stream
     */
    async execute(blockTitle: string): Promise<BlockOutput> {
        // Check cache first
        if (this.outputCache.has(blockTitle)) {
            return this.outputCache.get(blockTitle)!;
        }

        // Fetch block from database
        const blockRecord = await db.block.findUnique({
            where: { title: blockTitle }
        });

        if (!blockRecord) {
            throw new Error(`Block "${blockTitle}" not found`);
        }

        // Parse stored JSON args
        const args = JSON.parse(blockRecord.args);

        // Create block object with parsed fields
        const block: Block = {
            ...blockRecord,
            args
        };

        // Execute based on implementation type
        let output: BlockOutput;

        if (block.implementation === 'ItemsStream') {
            // ItemsIterator block - streams items from query
            output = this.executeItemsIterator(block);
        } else {
            // Digester block - transforms block outputs into content
            output = await this.executeDigester(block);
        }

        // Cache output
        this.outputCache.set(blockTitle, output);

        return output;
    }

    /**
     * Execute an ItemsIterator block.
     * All item queries go through ItemsIterator for proper filtering/pagination.
     */
    private executeItemsIterator(block: Block): BlockOutput {
        const iterator = new ItemsIterator({
            block,
            feedTitle: this.feedTitle,
            pageSize: 10
        });

        return {
            type: 'items',
            stream: iterator.stream
        };
    }

    /**
     * Execute a digester block.
     * Digesters receive an array of BlockOutputs from their input_blocks.
     */
    private async executeDigester(block: Block): Promise<BlockOutput> {
        const digesterConstructor = digesters[block.implementation];
        if (!digesterConstructor) {
            throw new Error(`Digester implementation "${block.implementation}" not found`);
        }

        // Get input blocks - must be specified in args.input_blocks
        const inputBlockTitles = block.args?.input_blocks as string[] | undefined;

        if (!inputBlockTitles || inputBlockTitles.length === 0) {
            throw new Error(`Digester block "${block.title}" must specify input_blocks in args`);
        }

        // Execute all input blocks and collect their outputs
        const inputs: BlockOutput[] = [];
        for (const inputTitle of inputBlockTitles) {
            const output = await this.execute(inputTitle);
            inputs.push(output);
        }

        // Create and execute digester with all inputs
        const digester = digesterConstructor(block.args || {});
        const contentStream = await digester(inputs);

        return {
            type: 'content',
            stream: contentStream
        };
    }

    /**
     * Clear the output cache.
     */
    clearCache(): void {
        this.outputCache.clear();
    }
}

/**
 * Convenience function to execute a block without managing an executor instance.
 */
export async function executeBlock(blockTitle: string, feedTitle: string = ''): Promise<BlockOutput> {
    const executor = new BlockExecutor(feedTitle);
    return executor.execute(blockTitle);
}
