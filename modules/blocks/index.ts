/**
 * Blocks module - unified system for block implementations.
 *
 * A block is a unit of content that can be:
 * 1. Displayed to the user (via UI)
 * 2. Fed to a digester for transformation
 *
 * Block implementations include:
 * - ItemsStream: Streams items from the database based on a Prisma query
 * - Digesters: Transform items into summarized content (e.g., NewsBriefing)
 */

// Re-export types
export type {
    BlockOutput,
    BlockContext,
    Digester,
    DigesterConstructor
} from './types';

// Re-export ItemsIterator
export { ItemsIterator, type ItemsIteratorInstructions } from './items_iterator';

// Re-export digesters
export { digesters, type DigestItem } from './digesters';

// Re-export BlockExecutor
export { BlockExecutor, executeBlock } from './executor';
