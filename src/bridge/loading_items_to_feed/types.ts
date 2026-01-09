export { type ItemsIteratorInstructions as Instructions } from '$root/modules/blocks/items_iterator';
import { type DisplayItem } from '$lib/types';
export type Chunk = DisplayItem;
export type FrontendRequest = 'start' | 'next' | 'close';
export type BackendResponse = string | { done: boolean, item: Chunk };
