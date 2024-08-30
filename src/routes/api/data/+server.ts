import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const req = await request.json();
	console.log(`Received request: db.item.${JSON.stringify(req.prisma_function)}(${JSON.stringify(req.prisma_query)})`); // For debugging purposes. todo: remove
	let res;
	if (req.prisma_function == 'findMany') {
		res = await db.item.findMany(req.prisma_query);
	} else if (req.prisma_function == 'update') {
		res = await db.item.update(req.prisma_query);
	}
	return json(res);
}