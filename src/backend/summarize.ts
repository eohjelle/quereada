import OpenAI from 'openai';
import { db } from '$src/backend/database';
import { sources, type Source } from '$modules/sources';
import type { ItemToSummarize } from '$lib/types';

const openai = new OpenAI();

// Function to summarize an item using the OpenAI API. 
export async function summarize(item: ItemToSummarize): Promise<ReadableStream>  {
    // Set itemToSummarize to avoid passing unnecessary fields to the OpenAI API.
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
        const res = new ReadableStream({
            start(controller) {
                controller.enqueue(item.summary);
                controller.close();
            }
        });
        return res;
    }
    const source = sources[item.source_name];
    let stream;
    if (!source) {
        throw new Error(`Source class not found for source ${item.source_name}`);
    } else {
        stream = await source.summarizeItem(item);
        const streams = stream.tee();
        saveSummary(item_id, streams[0]);
        return streams[1];
    }
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