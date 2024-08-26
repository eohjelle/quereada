import feeds from './[feed]/feeds';

export function load() {
    return { feeds: feeds.map((feed) => feed.feed_title) };
}