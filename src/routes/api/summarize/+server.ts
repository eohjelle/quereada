import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import { json, text } from '@sveltejs/kit';
import type { Item } from '@prisma/client';
import { db } from '$lib/server/database';
import util from 'util';

const openai = new OpenAI(OPENAI_API_KEY);

async function summarize(item: Partial<Item>) {
    console.log(`Summarizing ${item.title}...`);
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are an expert at reading and distilling the essential content of various articles. Your task is to summarize the text submitted by the user. The summary should be less than 200 words."},
            {
                role: "user",
                content: JSON.stringify(item),
            },
        ]
    });
    const summary = completion.choices[0].message.content;
    await db.item.update({where: {id: item.id}, data: {summary: summary}}); // Seems to not be updating? todo: fix
    return summary;
};

async function getSummaryStream(item: Partial<Item>) {
    console.log(`Getting summary stream for ${item.title}...`);
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are an expert at reading and distilling the essential content of various articles. Your task is to summarize the text submitted by the user. The summary should be less than 200 words."},
            {
                role: "user",
                content: JSON.stringify(item),
            },
        ],
        stream: true
    });
    // let res = '';
    // for await(const chunk of stream) {
    //     const message_chunk = chunk.choices[0]?.delta?.content;
    //     process.stdout.write(message_chunk || "");
    //     res += message_chunk;
    // }
    // return res;
    const getMessage = new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(chunk.choices[0]?.delta?.content || "");
        }
    });
}

// // todo:
// export async function POST({ request }) {
//     const item = await request.json();
//     // console.log(`Received request: summarize ${item.title} using OpenAI API.`)
//     const res = await summarize(item);
//     // console.log(`Summary: ${res}`);
//     // console.log(`The json version of the summary is ${util.inspect(json(res), false, null)}`);
//     return text(res); // todo: handle case where res is null
// }

export async function POST({ request }) {
    const item = await request.json();
    console.log(`Received request: summarize ${item.title}...`);
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
    const res = new ReadableStream({
        async start(controller) {
            const textEncoder = new TextEncoder();
            for await(const chunk of stream) {
                const message_chunk = chunk.choices[0]?.delta?.content;
                if (message_chunk) {
                    controller.enqueue(textEncoder.encode(message_chunk));
                    process.stdout.write(message_chunk || "");
                }
            }
            controller.close();
        }
    });
    return new Response(res, {
        headers: { 'Content-Type': 'text/event-stream'}
    });
}