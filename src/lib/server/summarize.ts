import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import { db } from '$lib/server/database';
import { sourceClasses } from './sources';
import type { ItemWithAuthors } from './types';

const openai = new OpenAI(OPENAI_API_KEY);

// Function to summarize an item using the OpenAI API. 
// This is called by the summarize method of the SourceWithFetch abstract class (see ./types.ts), and some of its subclasses in ./sources.
export async function summarize(item: ItemWithAuthors): Promise<ReadableStream>  {
    const itemToSummarize = {
        source: item.source_name,
        title: item.title,
        authors: item.authors.map((author) => author.name),
        description: item.description || "",
        content: item.content
    };
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are an expert at reading and distilling the essential content of various articles. Your task is to summarize the content of the item submitted by the user. The summary should be less than 200 words."},
            {
                role: "user",
                content: JSON.stringify(itemToSummarize),
            },
        ],
        stream: true
    });
    const res = new ReadableStream({
        async start(controller) {
            for await(const chunk of stream) {
                const message_chunk = chunk.choices[0]?.delta?.content;
                if (message_chunk) {
                    controller.enqueue(message_chunk);
                    // process.stdout.write(message_chunk || ""); // print to console
                }
            }
            controller.close();
        }
    });
    return res;
}

// Handle a request to summarize an item (typically by clicking the "summarize" button)
export async function handleSummarizeRequest(item_id: number): Promise<ReadableStream<string>> {
    // Check if the item is already summarized
    const item = await db.item.findUniqueOrThrow({
        where: {
            id: item_id
        },
        include: {
            authors: true
        }
    });
    if (item.summary) {
        console.log(`Item ${item_id} already summarized`);
        const res = new ReadableStream({
            start(controller) {
                controller.enqueue(item.summary);
                controller.close();
            }
        });
        return res;
    }
    const source = await db.source.findUniqueOrThrow({ where: { name: item.source_name } }).then((source) => new sourceClasses[source.source_class](source));
    let stream;
    if (!source) {
        throw new Error(`Source class not found for source ${item.source_name}`);
    } else if (source.summarize_item) {
        stream = await source.summarize_item(item);
    } else if (item.content) {
        stream = await summarize(item);
    } else {
        throw new Error(`Item with id ${item.id} and title ${item.title} can not be summarized.`)
    }
    const streams = stream.tee();
    saveSummary(item_id, streams[0]);
    return streams[1];
}

async function saveSummary(item_id: number, stream: ReadableStream<string>): Promise<void> {
    let summary = "";
    for await(const chunk of stream) {
        summary += chunk;
    }

    await db.item.update({
        where: { id: item_id },
        data: {
            summary: summary
        }
    });
}