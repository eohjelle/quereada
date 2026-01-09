import type { Item } from '$src/lib/types';

export type FilterItem = Omit<Item, 'checked_filters' | 'passed_filters'>;

/** This is the type of a filter. An item passes a filter if it returns true. */
export type Filter = (item: FilterItem) => Promise<boolean>;

/** This is the type of a filter constructor. Given some arguments, it returns a filter.
 * 
 * @example
 * This is a constructor for a filter that does nothing (in the sense that all items pass it).
 * const Trivial: FilterConstructor = ({}) => async (item: FilterItem) => true;
 */
export type FilterConstructor<T extends Record<string, any> = {}> = ((args: T) => Filter);


// Import all the filter implementations here. todo: do this dynamically?
import { RelevantToTopics } from './implementations/relevant_to_topics';

/**
 * This is the registry of available filter types.
 * These filters are used in modules/blocks/items_stream.
 * Each key represents a unique filter identifier, and its value is the corresponding filter constructor.
 */
export const filters: { [implementation: string]: FilterConstructor<any> } = {
    'RelevantToTopics': RelevantToTopics
}