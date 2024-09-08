import type { Source } from '@prisma/client';
import type { Item, Author } from '@prisma/client';

export type ItemWithAuthors = Item & { authors: Author[] };

export abstract class SourceWithFetch implements Partial<Source> {
    name: string;
    url?: string;
    channels?: string[];
    occurs_with_topic_groups_titles: string[] = [];
    date_added: Date = new Date();
    
    abstract fetch_new_items(): Promise<Array<[Item,Author[]]>>;

    summarize_item?(item: ItemWithAuthors): Promise<ReadableStream<Uint8Array>>;
}