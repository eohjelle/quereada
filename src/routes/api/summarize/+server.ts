import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import type { Item } from '@prisma/client';
import { db } from '$lib/server/database';

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
        ],
    });
    const summary = completion.choices[0].message.content;
    await db.item.update({where: {id: item.id}, data: {summary: summary}}); // Seems to not be updating? todo: fix
    return summary;
};

export async function POST({ request }) {
    const item = await request.json();
    console.log(`Received request: summarize ${item.title} using OpenAI API.`)
    const res = await summarize(item);
    console.log(`Summary: ${res}`);
    return json(res);
}