import { db } from '$lib/server/database';
import type { Author, Item } from '@prisma/client';
import type { SourceWithFetch } from './types';
import { TheAtlantic } from './sources/the_atlantic'; // todo: create more dynamic import of the source classes. 

const sourceClasses: { [key: string]: new (...args: any[]) => SourceWithFetch } = {
    'The Atlantic': TheAtlantic
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
    const sourceData = await db.source.findMany({ select: { name: true, url: true, channels: { select: { channel_name: true } } } });
    for (const source of sourceData) {
        const SourceClass = sourceClasses[source.name];
        const instance = new SourceClass({
            name: source.name,
            url: source.url,
            channels: source.channels.map(channel => channel.channel_name)
        });
        sources.push(instance);
    }
    return sources;
}

// Function to fetch all new items from all sources
export async function fetch_all_new_items(): Promise<void> {
    const sources = await loadSources();
    Promise.all(sources.map(async (source) => {
        console.log(`Fetching new items from ${source.name}...`);
        source.fetch_new_items()
        .then((new_item_authors_pairs) => {
            console.log(`Fetched ${new_item_authors_pairs.length} new items from ${source.name}.`);
            for (const [item, authors] of new_item_authors_pairs) {
                push_item_with_authors_to_db(item, authors);
            }
        }).catch((error) => console.error(`Error fetching new items from ${source.name}:`, error));
    }));
}