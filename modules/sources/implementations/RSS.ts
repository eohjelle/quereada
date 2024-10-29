
import { extract, type FeedEntry } from '@extractus/feed-extractor';
import { decode } from 'html-entities';
import { authorListFromByline, authorListToConnectOrCreateField } from '$lib/utils';
import type { FetchItem } from '$lib/types';
import { Source } from '../source';


export class RSS extends Source<{ urls: string[] }> {

    /** Extract text from an XML node. Function copied from feed-extractor. */
    private getText(value: any): string | undefined {
        const text = typeof value === 'object' ? (value._text || value['#text'] || value._cdata || value.$t) : value;
        return text ? decode(String(text).trim()) : undefined;
    } 

    private getAuthors(xmlItem: any): string[] {
        const getAuthorNamesFromField = (value: any): string[] => {
            if (typeof value === 'string') {
                return authorListFromByline(value);
            } else if (Array.isArray(value)) {
                return value.map(author => getAuthorNamesFromField(author)).flat();
            } else if (value['name']) {
                return getAuthorNamesFromField(value.name);
            } else if (this.getText(value) !== undefined) {
                return getAuthorNamesFromField(this.getText(value));
            } else {
                return [];
            }
        }
        const authors: string[] = [];
        if (xmlItem['dc:creator']) {
            authors.push(...getAuthorNamesFromField(xmlItem['dc:creator']))
        }
        if (xmlItem['author']) {
            authors.push(...getAuthorNamesFromField(xmlItem.author))
        }
        if (xmlItem['atom:author']) {
            authors.push(...getAuthorNamesFromField(xmlItem['atom:author']))
        }
        return authors;
    }

    private getContent(xmlItem: any): string | undefined {
        let result: string | undefined;
        if (xmlItem['content:encoded']) {
            result = this.getText(xmlItem['content:encoded']);
        } else if (xmlItem['content']) {
            result = this.getText(xmlItem['content']);
        }
        return result;
    }

    private getImageData(xmlItem: any): { image_link?: string, image_caption?: string, image_credit?: string } {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'ico', 'webp'];
        let image_link: string | undefined, image_caption: string | undefined, image_credit: string | undefined;

        if (xmlItem['media:credit']) {
            image_credit = this.getText(xmlItem['media:credit']);
        }
        if (xmlItem['media:title']) {
            image_caption = this.getText(xmlItem['media:title']);
        }
        if (xmlItem['media:description']) {
            image_caption = this.getText(xmlItem['media:description']) ?? image_caption;
        }
        if (xmlItem['media:content']) {
            for (const content of xmlItem['media:content']) {
                if (content['@_url'] && imageExts.some(ext => content['@_url'].endsWith(ext))) {
                    image_link = content['@_url'];
                    image_caption = this.getText(content['media:title']) ?? image_caption;
                    image_caption = this.getText(content['media:description']) ?? image_caption;
                    image_credit = this.getText(content['media:credit']) ?? image_credit;
                    return { image_link, image_caption, image_credit };
                }
            }
        }
        if (xmlItem.enclosure) {
            for (const enclosure of xmlItem.enclosure) {
                if (enclosure['@_url'] && imageExts.some(ext => enclosure['@_url'].endsWith(ext))) {
                    image_link = enclosure['@_url'];
                    image_caption = this.getText(enclosure['media:title']) ?? image_caption;
                    image_caption = this.getText(enclosure['media:description']) ?? image_caption;
                    image_credit = this.getText(enclosure['media:credit']) ?? image_credit;
                    return { image_link, image_caption, image_credit };
                }
            }
        }
        return { image_link, image_caption, image_credit };
    }

    /** Extracts items from a single RSS or Atom feed. Based on feed-extractor. */
    async fetchItemsFromUrl (url: string): Promise<FetchItem[]> {
        const feedItems = await extract(url, {
            getExtraEntryFields: (entryData) => {
                return {
                    authors: this.getAuthors(entryData),
                    content: this.getContent(entryData),
                    image_data: this.getImageData(entryData)
                }
            },
            xmlParserOptions: {
                isArray: (name: string) => {
                    return name === 'media:content' || name === 'enclosure' || name === 'dc:creator' || name === 'author'
                }
            }
        }).then(data => data.entries as (FeedEntry & { authors: string[], content?: string, image_data: { image_link?: string, image_caption?: string, image_credit?: string } })[]);
        
        if (!feedItems) {
            console.error(`No items found in feed ${url}`);
            return [];
        }

        const items: FetchItem[] = feedItems.map((item) => {
            if (!item.title || !item.link) {
                console.error(`Missing a required field (title or link) in item of feed ${url}`);
                return null;
            }
            return {
                title: item.title,
                link: item.link,
                description: item.description,
                date_published: item.published ? new Date(item.published!) : new Date(),
                authors: authorListToConnectOrCreateField(item.authors),
                content: item.content,
                number_of_words: item.content?.split(' ').length,
                ...item.image_data
            }
        }).filter(item => item !== null) as FetchItem[];
        return items;
    }

    public async fetchItemsFromSource () {
        const items: FetchItem[] = [];
        await Promise.all(this.args.urls.map(async (url) => {
            const new_items = await this.fetchItemsFromUrl(url);
            items.push(...new_items);
        }));
        return items;
    }
}
