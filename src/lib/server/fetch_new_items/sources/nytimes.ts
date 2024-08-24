import { NYTIMES_API_KEY } from '$env/static/private';
import type { Author, Item } from '@prisma/client';
import type { SourceWithFetch } from '../types';
import util from 'util'; // only used for debugging

function authors_from_byline(byline: string): Author[] {
    return byline
        .replace('By', '') // remove "By" from the beginning of the byline
        .replace('and', ',') // replace "and" with ","
        .split(',') // split the byline into an array of names
        .map((name: string) => ({ name: name.trim() })); // trim each name and create an Author object
}

export class NYTimesAPI implements SourceWithFetch{
    name: string = 'The New York Times';
    url: string = 'https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json';
    channels: string[] = []; // todo: add support for other channels
    date_added: Date = new Date();

    constructor({ name, url, channels }: { name: string; url: string; channels: string[] }) {};

    async fetch_new_items(channel: string) {
        const response = await fetch(`${this.url}?api-key=${NYTIMES_API_KEY}`);
        const data = await response.json();
        // console.log(`Loaded data from NYTimes API: ${util.inspect(data, false, null)}`);

        const item_authors_pairs: Array<[Item,Author[]]> = [];

        for (const raw_item of data.results) {
            const authors = authors_from_byline(raw_item.byline);
            const item: Item = {
                item_type: 'Link',
                source_name: this.name,
                lang_id: 'en-us',
                title: raw_item.title,
                description: raw_item.abstract,
                link: raw_item.url,
                date_published: new Date(raw_item.published_date),
                date_added: new Date(),
                // content: raw_item.abstract,
                // number_of_words: raw_item.abstract.split(' ').length,
            };
            if (raw_item.media[0]?.type == 'image') {
                item.image_link = raw_item.media[0]['media-metadata'].pop().url || null,
                item.image_caption = raw_item.media[0].caption || null,
                item.image_credit = raw_item.media[0].copyright || null
            };
            item_authors_pairs.push([item, authors]);
        }
        return item_authors_pairs;
    }
}