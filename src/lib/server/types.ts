import type { Source } from '@prisma/client';
import type { Item, Author } from '@prisma/client';
import { summarize_with_openai_api } from './summarize';

export abstract class SourceWithFetch implements Partial<Source> {
    name: string;
    channels?: string[];
    
    abstract fetch_new_items(): Promise<Array<[Item,Author[]]>>;

    summarize_item?(item: Item): Promise<ReadableStream<Uint8Array>> {
        if (!item.summarizable) {
            if (item.content) {
                throw new Error('Item is not summarizable despite having content. This should not happen.');
            }
            throw new Error('Item is not summarizable');
        } else if (!item.content) {
            throw new Error('Item has no content. Function must be implemented in subclass.');
        } else {
            return summarize_with_openai_api(item);
        }
    };
}