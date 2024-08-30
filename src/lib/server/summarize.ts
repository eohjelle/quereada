import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import type { Item } from '@prisma/client';

const openai = new OpenAI(OPENAI_API_KEY);

// Function to summarize an item using the OpenAI API. 
// This is called by the summarize method of the SourceWithFetch abstract class (see ./types.ts), and some of its subclasses in ./sources.
export async function summarize_with_openai_api(item: Item): Promise<ReadableStream<Uint8Array>> {
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are an expert at reading and distilling the essential content of various articles. Your task is to summarize the content of the item submitted by the user. The summary should be less than 200 words."},
            {
                role: "user",
                content: JSON.stringify(item),
            },
        ],
        stream: true
    });
    return new ReadableStream({
        async start(controller) {
            const textEncoder = new TextEncoder();
            for await(const chunk of stream) {
                const message_chunk = chunk.choices[0]?.delta?.content;
                if (message_chunk) {
                    controller.enqueue(textEncoder.encode(message_chunk));
                }
            }
            controller.close();
        }
    });
}