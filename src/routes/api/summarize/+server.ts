import { handleSummarizeRequest } from '$lib/server/summarize';



export async function POST({ request }) {
    const item = await request.json();
    console.log(`Received request: summarize with id = ${item.id}...`);
    const stream = await handleSummarizeRequest(item.id);
    const encodedStream = stream.pipeThrough(new TextEncoderStream());
    return new Response(encodedStream, {
        headers: { 'Content-Type': 'text/event-stream'}
    });
}