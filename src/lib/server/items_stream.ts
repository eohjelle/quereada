import { db } from './database';

export function getItemsReadableStream(prisma_query: object, page_size: number): ReadableStream {
    const itemsStream = new ItemsStream(prisma_query, page_size);
    return itemsStream.stream;
}

class ItemsStream {
    query: object;
    batch_size: number = 50;
    high_water_mark: number; // desired number of items to keep in the buffer
    cursor: number | null = null;
    stream: ReadableStream;
    // todo: blocks

    constructor(prisma_query: object, page_size: number = 5) {
        this.query = JSON.parse(JSON.stringify(prisma_query)); // make a deep copy because we will modify it
        this.high_water_mark = 2*page_size;
        this.stream = new ReadableStream(
            {
                start: (controller: ReadableStreamDefaultController) => {
                    console.log('Initializing stream...');
                },
                pull: async (controller: ReadableStreamDefaultController) => {
                    console.log('The cursor is at', this.cursor);
                    console.log('The query is', this.query);
                    // todo: modify query to include cursor, batch size, etc
                    const candidate_items = await db.item.findMany(prisma_query);
                    // console.log('The candidate items are', candidate_items);
                    // todo: implement cursor and filtering
                    candidate_items.forEach((item) => {controller.enqueue(item)});
                    console.log(`Enqueued ${candidate_items.length} items`);
                    // Close the stream if there are no more items to read
                    if (candidate_items.length < this.batch_size) {
                        console.log('Closing stream because we have reached the end of the items');
                        controller.close();
                    }
                },
                cancel: (reason) => {
                    console.log('Stream cancelled because', reason);
                }
            },
            new CountQueuingStrategy({
                highWaterMark: this.high_water_mark
            })
        );
    }
}