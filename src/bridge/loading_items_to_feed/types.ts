export type FrontendStatus = 'start' | 'ready' | 'close';
export type BackendStatus = 'start' | 'close';
export { type ItemsStreamInstructions as Instructions } from '$src/backend/items_stream';
export { type DisplayItem as Chunk } from '$lib/types';