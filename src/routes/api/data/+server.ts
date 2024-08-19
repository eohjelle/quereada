import Database from 'better-sqlite3';
import { db } from '$lib/server/database';


export async function GET({ url }) {
	const query = url.searchParams.get('query');
	console.log(`Received query: ${query}`); // For debugging purposes. todo: remove

	const stmt = db.prepare(query);
	const res = stmt.all();
	// console.log(res); // For debugging purposes. todo: remove
	return new Response(JSON.stringify(res));
}

// // This is only for debugging:..

// import { readdir } from 'fs/promises';

// async function listFiles() {
// 	try {
// 		const files = await readdir('.');
// 		console.log('Files and directories in the current directory:');
// 		files.forEach((file) => {
// 			console.log(file);
// 		});
// 	} catch (err) {
// 		console.error('Error reading directory:', err);
// 	}
// }
