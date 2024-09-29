import { sources } from '$modules/sources';

// Function to fetch all items from all sources
export async function fetchItemsFromSources() {
    await Promise.all(Object.values(sources).map(
        async (source) => {
            console.log(`Fetching new items from ${source.name}...`);
            await source.fetchItemsAndPushToDatabase();
            console.log(`Done fetching new items from ${source.name}.`);
        }
    )).then(() => {
        console.log(`Done fetching new items from all sources.`);
    }).catch((error) => {
        console.error(`Error fetching items from sources:`, error);
    });
}