import { error } from '@sveltejs/kit';
import feeds from './feeds.json';

export function load({ params }) {
    const feed = feeds.find((feed) => feed.feed_title === params.feed);
    if (!feed) throw error(404, 'Feed not found');
    return { feed };
}
