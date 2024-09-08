import { handleSummarizeRequest } from '$lib/server/summarize';

export async function POST({ request }) {
    const item = await request.json();
    console.log(`Received request: summarize with id = ${item.id}...`);
    return handleSummarizeRequest(item.id)
    .then((res) => new Response(res, {
        headers: { 'Content-Type': 'text/event-stream'}
    }));
}