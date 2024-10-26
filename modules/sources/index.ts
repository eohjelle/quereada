import type { SourceConstructorParams, Source } from './source';
import { db } from '$src/backend/database';

// Import source classes and create a dictionary mapping the source_type field to the correct class
// todo: create more dynamic import of the source classes. 
import { TheAtlantic } from './implementations/the_atlantic'; 
import { RSS } from './implementations/rss';
import { NYTimesAPI } from './implementations/nytimes';

const sourceClasses: { [key: string]: new (params: SourceConstructorParams<any>) => Source<any> } = {
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
            implementation: true, 
            args: true,
            default_values: true
        } 
    } );
    for (const source of sourceData) {
        const SourceClass = sourceClasses[source.implementation];
        const instance = new SourceClass({
            name: source.name,
            args: source.args ? JSON.parse(source.args) : undefined,
            default_values: source.default_values ? JSON.parse(source.default_values) : undefined
        });
        sources[source.name] = instance;
    }
    return sources;
}

export let sources = await loadSources();
export type { Source };

// Function to refresh the sources (used by src/backend/load_config.ts to refresh sources when config is updated)
export async function refreshSources() {
    sources = await loadSources();
}