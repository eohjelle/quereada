// import feeds from './[feed]/feeds';

// export function load() {
//     return { feeds: feeds.map((feed) => feed.feed_title) };
// }

import { db } from '$lib/server/database';
import util from 'util'; // only used for debugging

export async function load() {
    const feeds = await db.feed.findMany({ select: { title: true } });
    console.log(`From +layout.server.ts, we observe feeds: ${util.inspect(feeds, false, null)}`); // todo: remove this line
    return { feeds: feeds.map((feed) => feed.title) };
}