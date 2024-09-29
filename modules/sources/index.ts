import type { SourceConstructorParams, Source } from './source';
import { db } from '$src/backend/database';

// Import source classes and create a dictionary mapping the source_type field to the correct class
// todo: create more dynamic import of the source classes. 
import { TheAtlantic } from './implementations/the_atlantic'; 
import { RSS } from './implementations/rss';
import { NYTimesAPI } from './implementations/nytimes';

const sourceClasses: { [key: string]: new (params: SourceConstructorParams) => Source } = {
    'TheAtlantic': TheAtlantic,
    'RSS': RSS,
    'NYTimesAPI': NYTimesAPI,
}

// Function to load sources (construct the relevant classes) based on sources in database
async function loadSources(): Promise<{ [name: string]: Source }> {
    const sources: { [name: string]: Source } = {};
    const sourceData = await db.source.findMany( {
         select: { 
            name: true, 
            source_class: true, 
            url: true, 
            channels: { select: { channel_name: true } }
        } 
    } );
    for (const source of sourceData) {
        const SourceClass = sourceClasses[source.source_class];
        // console.log(`Source ${source.name} occurs with topic groups ${get_values(source.occurs_in_blocks)}`);
        const instance = new SourceClass({
            name: source.name,
            url: source.url || undefined,
            channels: source.channels.map((channel: { channel_name: string }) => channel.channel_name)
        });
        // console.log(`We have created the class for ${source.name}. It is ${util.inspect(instance, false, null)}`);
        sources[source.name] = instance;
    }
    return sources;
}

export const sources = await loadSources();
export type { Source };