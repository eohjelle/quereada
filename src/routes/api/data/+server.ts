import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';




// This endpoint is called by Feed.svelte to fetch items from the database.
export async function POST({ request }) {
	const req = await request.json();
	console.log(`Received request to /api/data: Calling db.item.${req.prisma_function}(${JSON.stringify(req.prisma_query)})`);
	let res;
	if (req.prisma_function == 'findMany') {
		res = await db.item.findMany(req.prisma_query);
	} else if (req.prisma_function == 'update') {
		res = await db.item.update(req.prisma_query);
	}
	// console.log(`Responding with ${util.inspect(res, false, null)}`); // For debugging purposes. todo: remove
	return json(res);
}