import { Source, type SourceConstructorParams } from '../source';
import { authorListToConnectOrCreateField } from '$lib/utils';
import { extract } from '@extractus/feed-extractor';
import type { FetchItem } from '$lib/types';



export class RSS extends Source {
    constructor({ name, url, lang_id }: SourceConstructorParams) {
        super({
            name: name,
            url: url,
            channels: [],
            item_type: 'Link',
            lang_id: lang_id
        });
    }

    async fetchItemsFromSource () {
        const feed = await extract(this.url!);
        const items: FetchItem[] = [];
        if (!feed.entries) {
            console.error(`No entries found in feed for ${this.name}`);
            return [];
        }
        for (const raw_item of feed.entries) {
            const authors: string[] = []; // todo: implement authors
            const item: FetchItem = {
                item_type: 'Link',
                title: raw_item.title || `Undefined title from ${this.name}`,
                description: raw_item.description || '',
                link: raw_item.link || '',
                authors: authorListToConnectOrCreateField(authors),
                date_published: raw_item.published ? new Date(raw_item.published) : undefined,
            };
            items.push(item);
        };
        return items
    }
}