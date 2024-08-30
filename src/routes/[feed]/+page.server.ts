import { db } from '$lib/server/database';
import util from 'util'; // only used for debugging

export async function load({ params }) {
    const feed = await db.feed.findUniqueOrThrow({
         select: { 
            title: true ,
            blocks: {
                select: {
                    header: true,
                    prisma_query: true,
                }
            }
        },
        where: { title: params.feed }
    });
    // Since prisma_query is stored in the db as a string, parse it into a json object
    for (const block of feed.blocks) {
        // console.log(`Block: ${util.inspect(block, false, null)}`); // todo: remove this line
        block.prisma_query = JSON.parse(block.prisma_query);
    };
    return { feed };
}