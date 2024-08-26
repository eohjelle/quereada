import { db } from '$lib/server/database';
import type { Author, Item } from '@prisma/client';
import type { SourceWithFetch } from './types';
import util from 'util'; // only used for debugging


// Import source classes and create a dictionary mapping the source_type field to the correct class
// todo: create more dynamic import of the source classes. 
import { TheAtlantic } from './sources/the_atlantic'; 
import { RSS } from './sources/rss';
import { NYTimesAPI } from './sources/nytimes';

const sourceClasses: { [key: string]: new (...args: any[]) => SourceWithFetch } = {
    'TheAtlantic': TheAtlantic,
    'RSS': RSS,
    'NYTimesAPI': NYTimesAPI,
}

// Some functions for pushing items to the database. They are called directly by the fetch methods of the sources.
export async function push_authors_to_db(authors: Author[]): Promise<void> {
    await Promise.all(authors.map(async (author) => {
        await db.author.upsert({
            where: author,
            update: {},
            create: author
        })
    }))
}

export async function push_item_to_db(item: Item): Promise<void> {
    await db.item.upsert({
        where: { link: item.link },
        update: item,
        create: item
    })
}

export async function push_item_with_authors_to_db(item: Item, authors: Author[]): Promise<void> {
    await Promise.all([push_authors_to_db(authors), push_item_to_db(item)])
    .then(async () => {
        await db.item.update({
            where: { link: item.link },
            data: { authors: { connect: authors } }
        })
    })
}


// Function to load sources (construct the relevant classes) based on sources in database
async function loadSources(): Promise<SourceWithFetch[]> {
    const sources: SourceWithFetch[] = [];
    const sourceData = await db.source.findMany({ select: { name: true, source_type: true, url: true, channels: { select: { channel_name: true } } } });
    for (const source of sourceData) {
        const SourceClass = sourceClasses[source.source_type];
        const instance = new SourceClass({
            name: source.name,
            url: source.url,
            channels: source.channels.map(channel => channel.channel_name)
        });
        // console.log(`We have created the class for ${source.name}. It is ${util.inspect(instance, false, null)}`);
        sources.push(instance);
    }
    return sources;
}

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch all new items from all sources
export async function fetch_all_new_items(): Promise<void> {
    const sources = await loadSources();
    await Promise.all(sources.map(async (source) => {
        console.log(`Fetching new items from ${source.name}...`);
        return source.fetch_new_items()
        .then(async (new_item_authors_pairs) => {
            console.log(`Fetched ${new_item_authors_pairs.length} items from ${source.name}.`);
            for (const [item, authors] of new_item_authors_pairs) {
                push_item_with_authors_to_db(item, authors);
            }
        }).catch((error) => console.error(`Error fetching new items from ${source.name}:`, error));
    }));
}