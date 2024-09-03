import { db } from '$lib/server/database';
import type { Author, Item } from '@prisma/client';
import { SourceWithFetch } from './types';
import util from 'util'; // only used for debugging
import { sourceClasses } from './sources';
import { update_relevance_of_item_to_topic_group } from './decide_if_relevant';
import { get_values } from '$lib/utils';

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

export async function push_item_with_authors_to_db(source, item: Item, authors: Author[]): Promise<void> {
    // console.log(`Called push_item_with_authors_to_db with source ${util.inspect(source, false, null)}`);
    await Promise.all([push_authors_to_db(authors), push_item_to_db(item)])
    .then(async () => {
        await db.item.update({
            where: { link: item.link },
            data: { authors: { connect: authors } }
        })
    });
    // If there are topic groups that occur with the source, we need to check if the item is relevant to them
    if (source.occurs_with_topic_groups_titles.length > 0) {
        const dbitem = await db.item.findUnique({
            where: { link: item.link },
            select: {
                source_name: true,
                id: true,
                title: true,
                description: true,
                checked_relevance_to_topic_groups: { select: { title: true } },
                relevant_topic_groups: { select: { title: true } }
            }
        });
        await Promise.all(source.occurs_with_topic_groups_titles.map(async (topic_group_title) => {
            return update_relevance_of_item_to_topic_group(dbitem, topic_group_title)
        }));
    }
}


// Function to load sources (construct the relevant classes) based on sources in database
async function loadSources(): Promise<SourceWithFetch[]> {
    const sources: SourceWithFetch[] = [];
    const sourceData = await db.source.findMany( {
         select: { 
            name: true, 
            source_class: true, 
            url: true, 
            channels: { select: { channel_name: true } }, 
            occurs_in_blocks: { select: { contains_topic_groups: { select: { title: true } } } } 
        } 
    } );
    for (const source of sourceData) {
        const SourceClass = sourceClasses[source.source_class];
        // console.log(`Source ${source.name} occurs with topic groups ${get_values(source.occurs_in_blocks)}`);
        const instance = new SourceClass({
            name: source.name,
            url: source.url,
            channels: source.channels.map(channel => channel.channel_name),
            occurs_with_topic_groups_titles: get_values(source.occurs_in_blocks)
        });
        // console.log(`We have created the class for ${source.name}. It is ${util.inspect(instance, false, null)}`);
        sources.push(instance);
    }
    return sources;
}

// Function to fetch all new items from all sources
export async function fetch_all_new_items(): Promise<void> {
    const sources = await loadSources();
    await Promise.all(sources.map(async (source) => {
        console.log(`Fetching new items from ${source.name}...`);
        console.log(`More info about source: ${util.inspect(source, false, null)}`);
        return source.fetch_new_items()
            .then(async (new_item_authors_pairs) => {
                console.log(`Fetched ${new_item_authors_pairs.length} items from ${source.name}. Checking relevance of items to topic groups and pushing to database...`);
                return Promise.all(new_item_authors_pairs.map(async ([item, authors]) => {return push_item_with_authors_to_db(source, item, authors)}));
            })
            .then(() => {
                console.log(`Done fetching new items from ${source.name}.`);
            })
            .catch((error) => {
                console.error(`Error fetching new items from ${source.name}:`, error);
            });
    }));
}