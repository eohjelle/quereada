export { type ItemsStreamInstructions as Instructions } from '$src/backend/items_stream';
import { type DisplayItem } from '$lib/types';
export type Chunk = DisplayItem;
export type FrontendRequest = 'start' | 'next' | 'close';
export type BackendResponse = string | { done: boolean, item: Chunk };
