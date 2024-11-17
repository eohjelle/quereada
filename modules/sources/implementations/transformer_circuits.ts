import { Source } from '../source';
import type { FetchItem } from '$lib/types';
import { extract } from '@extractus/article-extractor';
import { authorListFromByline, authorListToConnectOrCreateField } from '$lib/utils';
import { JSDOM } from 'jsdom';
import { db } from '$root/src/backend/database';

export class TransformerCircuits extends Source {
    private baseUrl = 'https://transformer-circuits.pub';

    constructor() {
        super({
            name: 'Transformer Circuits',
            default_values: {
                item_type: 'Article',
                lang_id: 'en',
                summarizable: true
            }
        });
    }

    private getMonthNumber(monthStr: string): number {
        const months: { [key: string]: number } = {
            'JANUARY': 0, 'FEBRUARY': 1, 'MARCH': 2, 'APRIL': 3,
            'MAY': 4, 'JUNE': 5, 'JULY': 6, 'AUGUST': 7,
            'SEPTEMBER': 8, 'OCTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11
        };
        return months[monthStr] ?? 0;
    }

    private async extractArticleData(
        link: string, 
        title: string, 
        dateInfo?: { month: string, year: number },
        description?: string,
    ): Promise<FetchItem | null> {
        try {
            const article = await extract(link);
            if (!article) return null;

            return {
                title: title.trim(),
                description: description ? description.trim() : article?.description ? article.description.trim() : undefined,
                content: article?.content,
                authors: article?.author ? authorListToConnectOrCreateField(authorListFromByline(article.author)) : undefined,
                // date_published: dateInfo ? new Date(dateInfo.year, this.getMonthNumber(dateInfo.month)) : new Date(),
                date_published: new Date(), // todo: fix
                image_link: article?.image,
                number_of_words: article?.content?.split(' ').length,
                link
            };
        } catch (error) {
            console.error(`Error extracting article data from ${link}:`, error);
            return null;
        }
    }

    async fetchItemsFromSource(): Promise<FetchItem[]> {
        const response = await fetch(this.baseUrl);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Find all article entries in the TOC section
        const articles = Array.from(doc.querySelectorAll('.toc .note, .toc .paper'));
        
        const articleLinks = articles.map(article => {
            const link = article as HTMLAnchorElement;
            const title = link.querySelector('h3')?.textContent || '';
            const description = link.querySelector('.description')?.textContent?.trim() || '';
            const date = link.previousElementSibling?.classList.contains('date') 
                ? link.previousElementSibling.textContent 
                : link.parentElement?.querySelector('.date')?.textContent || '';
            return {
                title,
                description,
                link: new URL(link.href, this.baseUrl).toString(),
                date: date ? {
                    month: date.split(' ')[0],
                    year: parseInt(date.split(' ')[1])
                } : undefined
            };
        });

        // Process each article
        const items = await Promise.all(
            articleLinks.map(async ({ title, description, link, date }) => {
                try {
                    if (await db.item.findFirst({ where: { link } })) {
                        return null;
                    }
                    const articleData = await this.extractArticleData(link, title, date, description);
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
