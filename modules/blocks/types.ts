import type { Prisma } from '@prisma/client';
import type { Block, DisplayItem, DigestItem } from '$lib/types';

/**
 * What a block produces - either items for display or content (HTML string chunks).
 */
export type BlockOutput =
    | { type: 'items'; stream: ReadableStream<DisplayItem> }
    | { type: 'content'; stream: ReadableStream<string>; sourceItems?: DigestItem[] };

/**
 * Context provided to block implementations when executing.
 */
export interface BlockContext {
    /** The block being executed */
    block: Block;
    /** Parsed query from block.query */
    query: Prisma.ItemFindManyArgs;
    /** Parsed args from block.args */
    args: Record<string, any>;
    /** Output from upstream block (for chained blocks) */
    upstreamOutput?: BlockOutput;
}

/**
 * A digester function that transforms block outputs into content.
 * Receives an array of BlockOutputs (item streams or digest text from upstream blocks).
 * All items are streamed via ItemsIterator to ensure proper filtering/pagination.
 */
export type Digester = (inputs: BlockOutput[]) => Promise<ReadableStream<string>>;

/**
 * A digester constructor - creates a digester given configuration args.
 * Args should include `input_blocks: string[]` specifying which blocks to consume.
 */
export type DigesterConstructor<T extends Record<string, any> = {}> = (args: T) => Digester;
