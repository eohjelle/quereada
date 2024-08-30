import { NYTIMES_API_KEY } from '$env/static/private';
import type { Author, Item } from '@prisma/client';
import type { SourceWithFetch } from '../types';
import util from 'util'; // only used for debugging

function authors_from_byline(byline: string): Author[] {
    return byline
        .replace('By ', '') // remove "By" from the beginning of the byline
        .replace(' and ', ',') // replace "and" with ","
        .split(',') // split the byline into an array of names
        .map((name: string) => ({ name: name.trim() })); // trim each name and create an Author object
}

export class NYTimesAPI implements SourceWithFetch{
    name: string = 'The New York Times';
    url: string = 'https://api.nytimes.com/svc';
    channels: string[] = ["topstories/v2/home.json", "mostpopular/v2/viewed/1.json"]; // todo: make channel names more intuitive
    date_added: Date = new Date();

    constructor({ name, url, channels }: { name: string; url: string; channels: string[] }) {};

    async fetch_new_items_from_channel(channel_code: string) {
        const response = await fetch(`${this.url}/${channel_code}?api-key=${NYTIMES_API_KEY}`);
        const data = await response.json();
        // console.log(`Loaded data from NYTimes API at endpoint ${this.url}/${channel_code}?api-key=${NYTIMES_API_KEY}: ${util.inspect(data, false, null)}`);

        const item_authors_pairs: Array<[Item,Author[]]> = [];

        for (const raw_item of data.results) {
            // console.log(`\n\n\nProcessing item: ${util.inspect(raw_item, false, null)}`);
            const authors = authors_from_byline(raw_item.byline);
            const item: Item = {
                item_type: 'Article',
                source_name: this.name,
                lang_id: 'en',
                title: raw_item.title,
                description: raw_item.abstract,
                link: raw_item.url,
                date_published: new Date(raw_item.published_date),
                date_added: new Date(),
                // content: raw_item.abstract,
                // number_of_words: raw_item.abstract.split(' ').length,
            };
            if (raw_item.media?.[0]?.type == 'image') {
                item.image_link = raw_item.media[0]['media-metadata'].pop().url || null,
                item.image_caption = raw_item.media[0].caption || null,
                item.image_credit = raw_item.media[0].copyright || null
            } else if (raw_item.multimedia?.[0]?.type == 'image') {
                item.image_link = raw_item.multimedia[0].url || null,
                item.image_caption = raw_item.multimedia[0].caption || null,
                item.image_credit = raw_item.multimedia[0].copyright || null
            }
            item_authors_pairs.push([item, authors]);
        }
        return item_authors_pairs;
    }

    async fetch_new_items() {
        const item_authors_pairs: Array<[Item,Author[]]> = [];
        await Promise.all(this.channels.map(async (channel_code) => {
            const new_items = await this.fetch_new_items_from_channel(channel_code);
            item_authors_pairs.push(...new_items);
        }));
        return item_authors_pairs;
    }
}