import { db } from '$lib/server/database';
import { fetch_all_new_items } from '$lib/server/fetch';

export async function GET() {
    try {
        await fetch_all_new_items();
        return new Response('Database updated successfully', { status: 200 });
    } catch (error) {
        console.error('Error updating database:', error);
        return new Response('Failed to update database', { status: 500 });
    }
}