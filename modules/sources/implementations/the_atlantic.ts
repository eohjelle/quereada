import { parseStringPromise } from 'xml2js';
import type { FetchItem } from '$lib/types';
import { Source } from '../source';
import { authorListToConnectOrCreateField } from '$lib/utils';

export class TheAtlantic extends Source {
    name: string = 'The Atlantic';
    url: string = 'https://www.theatlantic.com';
    channels: string[] = ['bestof'];
    defaultValues = {
        item_type: 'Article',
        lang_id: 'en',
        summarizable: true
    }

    async fetchItemsFromChannel(channel: string) {
        const parsed_xml = await fetch(`https://www.theatlantic.com/feed/${channel}/`)
            .then((response) => response.text())
            .then((text) => parseStringPromise(text));

        const items: FetchItem[] = [];

        for (const raw_item of parsed_xml.feed.entry) {
            const authors: string[] = raw_item.author.map((author: { name: string }) => (author.name[0]));
            const item: FetchItem = {
                title: raw_item.title[0]._,
                description: raw_item.summary?.[0]._ || null,
                link: raw_item.link?.[0].$.href,
                authors: authorListToConnectOrCreateField(authors),
                date_published: new Date(raw_item.published?.[0]),
                content: raw_item.content?.[0]._,
                number_of_words: raw_item.content[0]._.split(' ').length,
                image_link: raw_item['media:content']?.[0]['$'].url || null,
                image_credit: raw_item['media:content']?.[0]['$'].credit || null,
            };
            items.push(item);
        }
        return items;
    }

    async fetchItemsFromSource() {
        const items = await Promise.all(this.channels.map(channel => this.fetchItemsFromChannel(channel)));
        return items.flat();
    }
}
