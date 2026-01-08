import type { DigestItem } from '$src/lib/types';

export type { DigestItem };

/** This is the type of a digester function. It takes an array of items and returns a streaming response. */
export type Digester = (items: DigestItem[]) => Promise<ReadableStream<string>>;

/** This is the type of a digester constructor. Given some arguments, it returns a digester function.
 *
 * @example
 * const SimpleSummary: DigesterConstructor<{ style: string }> = ({ style }) =>
 *     async (items: DigestItem[]) => { ... };
 */
export type DigesterConstructor<T extends Record<string, any> = {}> = ((args: T) => Digester);


// Import all the digester implementations here
import { NewsBriefing } from './implementations/news_briefing';

/**
 * This is the registry of available digester types.
 * Each key represents a unique digester identifier, and its value is the corresponding digester constructor.
 */
export const digesters: { [implementation: string]: DigesterConstructor<any> } = {
    'NewsBriefing': NewsBriefing
}
