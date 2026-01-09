import { extract } from '@extractus/feed-extractor';
import { JSDOM } from 'jsdom';

export type RssValidationResult = {
    valid: boolean;
    title?: string;
    itemCount?: number;
    error?: string;
};

export type RssDiscoveryResult = {
    feeds: Array<{ url: string; title?: string }>;
    error?: string;
};

/**
 * Validate an RSS feed URL by attempting to fetch and parse it
 */
export async function validateRssFeed(url: string): Promise<RssValidationResult> {
    try {
        const feed = await extract(url);
        return {
            valid: true,
            title: feed?.title,
            itemCount: feed?.entries?.length ?? 0
        };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Discover RSS feeds from a website URL
 */
export async function discoverRssFeeds(websiteUrl: string): Promise<RssDiscoveryResult> {
    try {
        // Normalize URL
        let url = websiteUrl;
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        // Fetch the webpage
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Quereada RSS Reader/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const feeds: Array<{ url: string; title?: string }> = [];

        // Find RSS/Atom link elements
        const linkElements = document.querySelectorAll(
            'link[rel="alternate"][type="application/rss+xml"], ' +
            'link[rel="alternate"][type="application/atom+xml"], ' +
            'link[rel="alternate"][type="application/feed+json"]'
        );

        for (const link of linkElements) {
            const href = link.getAttribute('href');
            const title = link.getAttribute('title');

            if (href) {
                // Resolve relative URLs
                const feedUrl = new URL(href, url).toString();
                feeds.push({ url: feedUrl, title: title || undefined });
            }
        }

        // If no feeds found via link tags, try common paths
        if (feeds.length === 0) {
            const commonPaths = [
                '/feed',
                '/feed.xml',
                '/rss',
                '/rss.xml',
                '/atom.xml',
                '/feed/rss',
                '/index.xml'
            ];

            const baseUrl = new URL(url);
            for (const path of commonPaths) {
                try {
                    const testUrl = new URL(path, baseUrl).toString();
                    const validation = await validateRssFeed(testUrl);
                    if (validation.valid) {
                        feeds.push({ url: testUrl, title: validation.title });
                        break; // Found one, stop checking
                    }
                } catch {
                    // Continue to next path
                }
            }
        }

        return { feeds };
    } catch (error) {
        return {
            feeds: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
