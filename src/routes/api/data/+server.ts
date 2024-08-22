import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const req = await request.json();
	console.log(`Received request: db.item.${JSON.stringify(req.prisma_function)}(${JSON.stringify(req.prisma_args)})`); // For debugging purposes. todo: remove
	let res;
	if (req.prisma_function == 'findMany') {
		res = await db.item.findMany(req.prisma_args);
	} else if (req.prisma_function == 'update') {
		res = await db.item.update(req.prisma_args);
	}
	return json(res);
}