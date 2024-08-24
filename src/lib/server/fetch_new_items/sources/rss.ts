import { SourceWithFetch } from '../types';
import Parser from 'rss-parser';
import { extract } from '@extractus/feed-extractor';
import util from 'util'; // only used for debugging

import type { Item, Author } from '@prisma/client';




export class RSS implements SourceWithFetch {
    name: string;
    url: string;
    channels: string[] = [];
    date_added: Date = new Date();

    constructor({ name, url, channels }: { name: string; url: string; channels: string[] }) {
        this.name = name;
        this.url = url;
    }

    async fetch_new_items() {
        // const parser = new Parser();
        // const feed1 = await parser.parseURL(this.url);
        // console.log(`\n\n\n\n\nHere is the feed using rss-parser:`); // useful for debugging. todo: remove
        // console.log(util.inspect(feed1));
        
        const feed2 = await extract(this.url);
        // console.log(`\n\n\n\n\nHere is the feed using @extractus/feed-extractor:`); // useful for debugging. todo: remove
        const item_authors_pairs: Array<[Item,Author[]]> = [];
        for (const raw_item of feed2.entries) {
            const authors: Author[] = [];
            const item: Item = {
                item_type: 'Link',
                source_name: this.name,
                title: raw_item.title,
                description: raw_item.description || null,
                link: raw_item.link,
                date_published: new Date(raw_item.published),
                date_added: new Date()
            };
            item_authors_pairs.push([item, authors]);
        };
        return item_authors_pairs
    }
}