import { db } from '$lib/server/database';
import { update_relevance_of_item_to_topic_group_in_db } from '$src/lib/server/decide_if_relevant.js';
import { json } from '@sveltejs/kit';
import util from 'util'; // only used for debugging. todo: remove
import { get_values } from '$lib/utils';



// This endpoint is called by Feed.svelte to fetch items from the database.
export async function POST({ request }) {
	const req = await request.json();
	console.log(`Received request to /api/data: Calling db.item.${req.prisma_function}(${JSON.stringify(req.prisma_query)})`);
	let res;
	if (req.prisma_function == 'findMany') {
		if (!req.prisma_query.where?.relevant_topic_groups) {
			res = await db.item.findMany(req.prisma_query);
		} else {
			// // In this case, we need extra logic to handle the relevant_topic_groups field.
			// // todo: implement this in a more efficient way
			// req.prisma_query.include.checked_relevance_to_topic_groups = true;
			// res = await findMany_with_relevant_topic_groups(req.prisma_query);
			res = await db.item.findMany(req.prisma_query); // for now we'll just ignore the relevant_topic_groups field here 
		}		
	} else if (req.prisma_function == 'update') {
		res = await db.item.update(req.prisma_query);
	}
	// console.log(`Responding with ${util.inspect(res, false, null)}`); // For debugging purposes. todo: remove
	return json(res);
}

// Essentially the same as db.item.findMany with some additional logic to handle the relevant_topic_groups field.
async function findMany_with_relevant_topic_groups(query) {
	console.log(`Called findMany_with_relevant_topic_groups with query: ${util.inspect(query, false, null)}`);
	let items = await db.item.findMany(query); // this doesn't work with 'some' or 'every' in the where relevant_topic_groups field
	console.log(`Found ${items.length} items: ${util.inspect(items, false, null)}`);
	let retry = false;
	for (const topic_group_title of get_values(query.where.relevant_topic_groups)) {
		console.log(`Checking for items relevant to topic group ${topic_group_title}`);
		await Promise.all(items.map(async (item) => {
			const checked_topic_group_titles = item.checked_relevance_to_topic_groups.map(topic_group => topic_group.title);
			console.log(`Has item ${item.title} been checked for relevance to topic group ${topic_group_title}? ${checked_topic_group_titles.includes(topic_group_title)}`);
			if (!checked_topic_group_titles.includes(topic_group_title)) {
				console.log(`Item ${item.title} has not been checked for relevance to topic group ${topic_group_title}. Updating relevance...`);
				await update_relevance_of_item_to_topic_group_in_db(item, topic_group_title);
				retry = true;
			}
		}));
	}
	if (retry) {
		return await findMany_with_relevant_topic_groups(query);
	}
	return items;
}