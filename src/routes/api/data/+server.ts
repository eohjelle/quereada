import { db } from '$lib/server/database';
import { update_relevance_of_item_to_topic_group } from '$lib/server/decide_if_relevant.js';
import { json } from '@sveltejs/kit';
import util from 'util'; // only used for debugging. todo: remove
import { get_values, cartesian_product } from '$lib/utils';




// This endpoint is called by Feed.svelte to fetch items from the database.
export async function POST({ request }) {
	const req = await request.json();
	console.log(`Received request to /api/data: Calling db.item.${req.prisma_function}(${JSON.stringify(req.prisma_query)})`);
	let res;
	if (req.prisma_function == 'findMany') {
		if (!req.prisma_query.where?.relevant_topic_groups) {
			res = await db.item.findMany(req.prisma_query);
		} else {
			// In this case, we need extra logic to handle the relevant_topic_groups field.
			// res = await findMany_with_relevant_topic_groups(req.prisma_query);
			res = await db.item.findMany(req.prisma_query);
		}		
	} else if (req.prisma_function == 'update') {
		res = await db.item.update(req.prisma_query);
	}
	// console.log(`Responding with ${util.inspect(res, false, null)}`); // For debugging purposes. todo: remove
	return json(res);
}

// // Essentially the same as db.item.findMany with some additional logic to handle the relevant_topic_groups field.
// async function findMany_with_relevant_topic_groups(query) {
// 	console.log(`Called findMany_with_relevant_topic_groups with query: ${util.inspect(query, false, null)}`);
// 	const new_query = JSON.parse(JSON.stringify(query)); // we don't want to modify the original query

// 	// Modify new_query and get candidate items (possibly not satisfying the constraint on the relevant_topic_groups field)
// 	new_query.include.checked_relevance_to_topic_groups = true; // this is necessary to get the relevant_topic_groups field
// 	const where_relevant_to_topic_groups_value = new_query.where.relevant_topic_groups; // we need to save this value
// 	delete new_query.where.relevant_topic_groups; // we don't want to filter by this field here
// 	const candidate_items = await db.item.findMany(new_query); // this doesn't work with 'some' or 'every' in the where relevant_topic_groups field
// 	if (candidate_items.length == 0) return candidate_items;

// 	// Update the relevant_topic_groups field for each candidate item and each topic group
// 	await Promise.all(cartesian_product(candidate_items, get_values(where_relevant_to_topic_groups_value)).map(
// 		async ([item, topic_group_title]) => {
// 			await update_relevance_of_item_to_topic_group(item, topic_group_title);
// 		}
// 	));

// 	// Get those candidate items that satisfy the constraint on the relevant_topic_groups field
// 	new_query.where.relevant_topic_groups = where_relevant_to_topic_groups_value;
// 	const old_where_id = new_query.where.id || {};
// 	new_query.where.id = { in: candidate_items.map(item => item.id) };
// 	const relevant_items = await db.item.findMany(new_query);

// 	// If there are no relevant items, return an empty array

// 	// Return the relevant items, and if there are some that may have been left out, get them as well
// 	const left_over = candidate_items.length - relevant_items.length;
// 	if (left_over == 0) {
// 		console.log(`Returning ${relevant_items.length} relevant items`);
// 		return relevant_items;
// 	} else {
// 		console.log(`Returning ${relevant_items.length} relevant items and ${left_over} additional items`);
// 		new_query.where.id = old_where_id;
// 		new_query.where.id.notIn = new_query.where.id.notIn || [];
// 		new_query.where.id.notIn = [...new_query.where.id.notIn, ...candidate_items.map(item => item.id)];
// 		new_query.take = left_over;
// 		const additional_items = await findMany_with_relevant_topic_groups(new_query);
// 		console.log(`Found ${additional_items.length} additional items`);
// 		return [...relevant_items, ...additional_items];
// 	}
// }