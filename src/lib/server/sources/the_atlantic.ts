import { parseStringPromise } from 'xml2js';
import type { Item, Author } from '@prisma/client';
import type { SourceWithFetch } from '../types';
import util from 'util'; // only used for debugging

export class TheAtlantic implements SourceWithFetch {
    name: string = 'The Atlantic';
    url: string = 'https://www.theatlantic.com/feed/';
    channels: string[] = ['bestof'];
    occurs_with_topic_groups_titles: string[] = [];
    date_added: Date = new Date();

    constructor({ name, url, channels, occurs_with_topic_groups_titles }: { name: string, url: string, channels: string[], occurs_with_topic_groups_titles: string[] }) {
        this.channels = channels;
        this.occurs_with_topic_groups_titles = occurs_with_topic_groups_titles;
    }

    async fetch_new_items_from_channel(channel: string) {
        const parsed_xml = await fetch(`https://www.theatlantic.com/feed/${channel}/`)
            .then((response) => response.text())
            .then((text) => parseStringPromise(text));

        const item_authors_pairs: Array<[Item,Author[]]> = [];

        for (const raw_item of parsed_xml.feed.entry) {
            // console.log(`\n\n\n\n\nHere is a raw item:`); // useful for debugging. todo: remove
            // console.log(util.inspect(raw_item, false, null));

            const authors = raw_item.author.map((author: { name: string }) => ({ name: author.name[0] }));
            const item: Item = {
                item_type: 'Article',
                source_name: this.name,
                lang_id: 'en',
                title: raw_item.title[0]._,
                description: raw_item.summary?.[0]._ || null,
                link: raw_item.link?.[0].$.href,
                date_published: new Date(raw_item.published?.[0]),
                date_added: new Date(),
                content: raw_item.content?.[0]._,
                number_of_words: raw_item.content[0]._.split(' ').length,
                image_link: raw_item['media:content']?.[0]['$'].url || null,
                image_credit: raw_item['media:content']?.[0]['$'].credit || null,
                summarizable: true
            };
            item_authors_pairs.push([item, authors]);
        }
        return item_authors_pairs
    }

    async fetch_new_items() {
        const item_authors_pairs = await Promise.all(this.channels.map(channel => this.fetch_new_items_from_channel(channel)));
        return item_authors_pairs.flat();
    }
}