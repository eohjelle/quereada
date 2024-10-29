import type { FetchItem } from '$lib/types';
import { Source, type SourceConstructorParams } from '../source';
import { authorListFromByline, authorListToConnectOrCreateField } from '$lib/utils';

// This class is not currently used because it doesn't add any value over the RSS implementation.
// But it's kept here for now in case it becomes useful in the future.
export class NYTimesAPI extends Source<{ channel_codes: string[] }> {
    constructor({ args = { channel_codes: ["topstories/v2/home.json", "mostpopular/v2/viewed/1.json"] } }: SourceConstructorParams<{ channel_codes: string[] }>) {
        // todo: make channel names more intuitive
        super({
            name: 'The New York Times',
            args: args,
            default_values: {
                item_type: 'Article',
                lang_id: 'en',
                summarizable: false // todo: implement summarization and make this true
            }
        })
    }

    async fetchItemsFromChannel(channel_code: string) {
        const response = await fetch(`https://api.nytimes.com/svc/${channel_code}?api-key=${process.env.NYTIMES_API_KEY}`);
        const data = await response.json();

        const items: FetchItem[] = [];
        
        for (const raw_item of data.results) {
            const authors = authorListFromByline(raw_item.byline);
            const item: FetchItem = {
                title: raw_item.title,
                description: raw_item.abstract,
                link: raw_item.url,
                authors: authorListToConnectOrCreateField(authors),
                date_published: new Date(raw_item.published_date)
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
            items.push(item);
        }
        return items;
    }

    async fetchItemsFromSource() {
        const items: FetchItem[] = [];
        await Promise.all(this.args.channel_codes.map(async (channel_code) => {
            const new_items = await this.fetchItemsFromChannel(channel_code);
            items.push(...new_items);
        }));
        return items;
    }
}