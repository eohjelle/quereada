/**
 * Digesters module - transforms items into summarized content.
 *
 * Digesters take a ReadableStream of DisplayItems and produce a streaming
 * HTML response that can be displayed or fed to another digester.
 */

import type { DigestItem, DisplayItem } from '$lib/types';
import type { Digester, DigesterConstructor, BlockOutput } from '../types';

// Re-export types for convenience
export type { DigestItem, DisplayItem };
export type { Digester, DigesterConstructor, BlockOutput };

// Import digester implementations
import { LLMDigest } from './implementations/llm_digest';

/**
 * Registry of available digester implementations.
 * Each key is a unique digester identifier used in block.implementation.
 */
export const digesters: { [implementation: string]: DigesterConstructor<any> } = {
    'LLMDigest': LLMDigest
};
