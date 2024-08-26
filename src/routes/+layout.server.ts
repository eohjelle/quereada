import feeds from './[feed]/feeds.json';

export function load({ params }) {
    return { feeds: feeds.map((feed) => feed.feed_title) };
}