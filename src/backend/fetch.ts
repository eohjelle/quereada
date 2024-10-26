import { sources } from '$modules/sources';

// Function to fetch all items from all sources
export async function fetchItemsFromSources() {
    await Promise.all(Object.values(sources).map(
        async (source) => {
            console.log(`Fetching new items from ${source.name}...`);
            await source.fetchItemsAndPushToDatabase().then(() => {
                console.log(`Done fetching new items from ${source.name}.`);
            }).catch((error) => {
                console.error(`Could not fetch items from ${source.name}.`, error);
            })
        }
    )).then(() => {
        console.log(`Done fetching new items from all sources.`);
    });
}