import { Source } from '../source';
import type { FetchItem } from '$lib/types';
import { extract } from '@extractus/article-extractor';
import { authorListFromByline, authorListToConnectOrCreateField } from '$lib/utils';
import { JSDOM } from 'jsdom';
import { db } from '$root/src/backend/database';

export class Aeon extends Source {
    constructor() {
        super({
            name: 'Aeon',
            default_values: {
                item_type: 'Article',
                lang_id: 'en',
                summarizable: true
            }
        });
    }

    private async extractArticleData(link: string): Promise<FetchItem | null> {
        const article = await extract(link);
        if (!article) return null;
        if (!article.title) {
            console.error(`Required field 'title' is missing from article ${link}`);
            return null;
        }

        // Clean up the title by removing '| Aeon Essays' suffix
        const cleanTitle = article.title.replace(/\s*\|\s*Aeon Essays$/, '');

        return {
            title: cleanTitle,
            description: article.description,
            content: article.content,
            authors: article.author ? authorListToConnectOrCreateField(authorListFromByline(article.author)) : undefined,
            date_published: article.published ? new Date(article.published) : new Date(),
            image_link: article.image,
            number_of_words: article.content?.split(' ').length,
            link
        };
    }

    async fetchItemsFromSource(): Promise<FetchItem[]> {
        // Fetch the homepage
        const response = await fetch('https://aeon.co');
        const html = await response.text();

        // Parse the HTML using jsdom
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Find all article links and their associated authors
        const articleLinks = Array.from<Element>(doc.querySelectorAll('a'))
            .filter(a => (a as HTMLAnchorElement).href.includes('/essays/'))
            .map(a => {
                const link = (a as HTMLAnchorElement).href;
                
                return {
                    link: link.startsWith('http') ? link : `https://aeon.co${link}`,
                    author: '' // TODO: Add author
                };
            })
            .filter((value, index, self) => 
                self.findIndex(v => v.link === value.link) === index
            ); // Remove duplicates

        // Process each article
        const items = await Promise.all(
            articleLinks.map(async ({ link, author }) => {
                try {
                    if (await db.item.findFirst({ where: { link } })) {
                        return null;
                    }
                    const articleData = await this.extractArticleData(link);
                    if (articleData && author) {
                        articleData.authors = authorListToConnectOrCreateField(authorListFromByline(author));
                    }
                    return articleData;
                } catch (error) {
                    console.error(`Error extracting data from ${link}:`, error);
                    return null;
                }
            })
        );

        return items.filter((item): item is FetchItem => item !== null);
    }
}
