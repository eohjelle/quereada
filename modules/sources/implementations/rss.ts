import { Source, type SourceConstructorParams } from '../source';
import { authorListToConnectOrCreateField } from '$lib/utils';
import Parser from 'rss-parser';
import { extract } from '@extractus/feed-extractor';
import util from 'util'; // only used for debugging

import type { FetchItem, Author } from '$lib/types';


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
        // const parser = new Parser();
        // const feed1 = await parser.parseURL(this.url);
        // console.log(`\n\n\n\n\nHere is the feed using rss-parser:`); // useful for debugging. todo: remove
        // console.log(util.inspect(feed1));
        
        const feed2 = await extract(this.url!);
        // console.log(`\n\n\n\n\nHere is the feed using @extractus/feed-extractor:`); // useful for debugging. todo: remove
        const items: FetchItem[] = [];
        if (!feed2.entries) {
            console.error(`No entries found in feed for ${this.name}`);
            return [];
        }
        for (const raw_item of feed2.entries) {
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