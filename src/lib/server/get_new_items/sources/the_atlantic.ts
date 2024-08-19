import Parser from 'rss-parser';
import { db } from '$lib/server/database';

const parser = new Parser();

export class TheAtlantic {
    name: string = 'The Atlantic';
    url: string = 'https://www.theatlantic.com/feed/';
    channels: string[] = ['bestof']

    static async fetch() {
        const feed = await parser.parseURL('https://www.theatlantic.com/feed/all/');
        console.log(feed.title);

        feed.items.forEach(item => {
            console.log(item.title + ':' + item.link);
        });
    }
}

export async function fetch(url: string) {
    console.log('Fetching articles from The Atlantic...');

}