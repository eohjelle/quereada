import { db } from './database';
import { loadConfig, type ConfigSource, type ConfigQuery, type ConfigFeed, type ConfigBlock } from './load_config';
import { fetchItemsFromSources } from './fetch';
import { addSourceToConfig, addQueryToConfig, addQueryAndFeedToConfig, addBlockToConfig, addFeedOnlyToConfig } from '$src/lib/config-writer';

export type OperationResult = { success: boolean; error?: string };

/**
 * Add a new RSS source to the config file
 */
export async function addRssSource(
    configPath: string,
    source: {
        name: string;
        urls: string[];
        defaultValues?: {
            item_type?: 'Article' | 'Link';
            lang_id?: string;
            summarizable?: boolean;
        };
    }
): Promise<OperationResult> {
    try {
        // Check for duplicate source name
        const existingSource = await db.source.findUnique({
            where: { name: source.name }
        });
        if (existingSource) {
            throw new Error(`Source with name "${source.name}" already exists`);
        }

        const configSource: ConfigSource = {
            name: source.name,
            implementation: 'RSS',
            args: { urls: source.urls },
            default_values: source.defaultValues
        };

        await addSourceToConfig(configPath, configSource);

        // Reload config and fetch new items
        await loadConfig();
        await fetchItemsFromSources();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Add a new query to the config file
 */
export async function addQuery(
    configPath: string,
    query: ConfigQuery,
    createFeed: boolean = true
): Promise<OperationResult> {
    try {
        // Check for duplicate block title
        const existingBlock = await db.block.findUnique({
            where: { title: query.title }
        });
        if (existingBlock) {
            throw new Error(`Query/block with title "${query.title}" already exists`);
        }

        if (createFeed) {
            await addQueryAndFeedToConfig(configPath, query);
        } else {
            await addQueryToConfig(configPath, query);
        }

        await loadConfig();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Add a new digest block to the config file
 */
export async function addDigest(
    configPath: string,
    block: {
        title: string;
        implementation: string;
        args: {
            input_blocks: string[];
            focus_areas?: string[];
            [key: string]: any;
        };
    }
): Promise<OperationResult> {
    try {
        // Check for duplicate block title
        const existingBlock = await db.block.findUnique({
            where: { title: block.title }
        });
        if (existingBlock) {
            throw new Error(`Block with title "${block.title}" already exists`);
        }

        const configBlock: ConfigBlock = {
            title: block.title,
            implementation: block.implementation,
            args: block.args
        };

        await addBlockToConfig(configPath, configBlock);
        await loadConfig();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Add a new feed to the config file
 */
export async function addFeed(
    configPath: string,
    feed: {
        title: string;
        blocks: string[];
    }
): Promise<OperationResult> {
    try {
        // Check for duplicate feed title
        const existingFeed = await db.feed.findUnique({
            where: { title: feed.title }
        });
        if (existingFeed) {
            throw new Error(`Feed with title "${feed.title}" already exists`);
        }

        const configFeed: ConfigFeed = {
            title: feed.title,
            blocks: feed.blocks
        };

        await addFeedOnlyToConfig(configPath, configFeed);
        await loadConfig();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
