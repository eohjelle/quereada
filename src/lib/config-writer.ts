import fs from 'fs';
import type { ConfigSource, ConfigQuery, ConfigFeed, ConfigBlock } from '$src/backend/load_config';
import { importTypescript } from '$src/lib/import';

interface ArrayBoundary {
    name: string;
    contentStart: number;  // Position after opening bracket
    contentEnd: number;    // Position of closing bracket
    isEmpty: boolean;
}

/**
 * Find the boundaries of exported arrays in a config file.
 * Handles: export const sources: ConfigSource[] = [ ... ];
 */
export function findArrayBoundaries(content: string): Map<string, ArrayBoundary> {
    const boundaries = new Map<string, ArrayBoundary>();

    // Match patterns like: export const sources: ConfigSource[] = [
    const arrayPattern = /export\s+const\s+(\w+)\s*:\s*\w+\[\]\s*=\s*\[/g;

    let match;
    while ((match = arrayPattern.exec(content)) !== null) {
        const arrayName = match[1];
        const openBracketPos = match.index + match[0].length - 1;

        // Find the matching closing bracket
        let depth = 1;
        let pos = openBracketPos + 1;

        while (depth > 0 && pos < content.length) {
            const char = content[pos];

            // Skip strings (handle both single and double quotes)
            if (char === '"' || char === "'") {
                const quote = char;
                pos++;
                while (pos < content.length && content[pos] !== quote) {
                    if (content[pos] === '\\') pos++; // Skip escaped chars
                    pos++;
                }
            }
            // Skip template literals
            else if (char === '`') {
                pos++;
                while (pos < content.length && content[pos] !== '`') {
                    if (content[pos] === '\\') pos++;
                    pos++;
                }
            }
            // Track bracket depth
            else if (char === '[') {
                depth++;
            }
            else if (char === ']') {
                depth--;
                if (depth === 0) {
                    // Check if array content is empty (only whitespace)
                    const contentBetween = content.slice(openBracketPos + 1, pos).trim();
                    boundaries.set(arrayName, {
                        name: arrayName,
                        contentStart: openBracketPos + 1,
                        contentEnd: pos,
                        isEmpty: contentBetween.length === 0
                    });
                    break;
                }
            }
            pos++;
        }
    }

    return boundaries;
}

/**
 * Escape a string for use in TypeScript source code
 */
function escapeString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * Serialize a value to TypeScript code
 */
function serializeValue(value: any, indent: string = ''): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    if (typeof value === 'string') {
        return `'${escapeString(value)}'`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const items = value.map(v => serializeValue(v, indent + '    '));
        if (items.every(i => !i.includes('\n') && i.length < 40)) {
            return `[ ${items.join(', ')} ]`;
        }
        return `[\n${indent}    ${items.join(`,\n${indent}    `)}\n${indent}]`;
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return '{}';

        const lines = entries.map(([k, v]) => {
            const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${escapeString(k)}'`;
            return `${indent}    ${key}: ${serializeValue(v, indent + '    ')}`;
        });

        return `{\n${lines.join(',\n')}\n${indent}}`;
    }

    return String(value);
}

/**
 * Serialize a ConfigSource to TypeScript code
 */
export function serializeSource(source: ConfigSource): string {
    const lines: string[] = ['    {'];

    lines.push(`        name: '${escapeString(source.name)}',`);
    lines.push(`        implementation: '${escapeString(source.implementation)}',`);

    if (source.args) {
        lines.push(`        args: ${serializeValue(source.args, '        ')},`);
    }

    if (source.default_values) {
        lines.push(`        default_values: ${serializeValue(source.default_values, '        ')}`);
    } else {
        // Remove trailing comma from last line
        lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    }

    lines.push('    }');
    return lines.join('\n');
}

/**
 * Serialize a ConfigQuery to TypeScript code
 */
export function serializeQuery(query: ConfigQuery): string {
    const { title, ...queryFields } = query;
    const lines: string[] = ['    {'];

    lines.push(`        title: '${escapeString(title)}',`);

    const fieldEntries = Object.entries(queryFields);
    fieldEntries.forEach(([key, value], index) => {
        const isLast = index === fieldEntries.length - 1;
        lines.push(`        ${key}: ${serializeValue(value, '        ')}${isLast ? '' : ','}`);
    });

    lines.push('    }');
    return lines.join('\n');
}

/**
 * Serialize a ConfigBlock to TypeScript code
 */
export function serializeBlock(block: ConfigBlock): string {
    const lines: string[] = ['    {'];

    lines.push(`        title: '${escapeString(block.title)}',`);
    lines.push(`        implementation: '${escapeString(block.implementation)}',`);
    lines.push(`        args: ${serializeValue(block.args, '        ')}`);

    lines.push('    }');
    return lines.join('\n');
}

/**
 * Serialize a ConfigFeed to TypeScript code
 */
export function serializeFeed(feed: ConfigFeed): string {
    const blocks = feed.blocks.map(b => `'${escapeString(b)}'`).join(', ');
    return `    {\n        title: '${escapeString(feed.title)}',\n        blocks: [ ${blocks} ]\n    }`;
}

/**
 * Insert a new item into an array in the config file
 */
function insertIntoArray(
    content: string,
    boundary: ArrayBoundary,
    serializedItem: string
): string {
    const insertPos = boundary.contentEnd;

    if (boundary.isEmpty) {
        // Empty array - just add the item
        return content.slice(0, insertPos) +
               '\n' + serializedItem + '\n' +
               content.slice(insertPos);
    } else {
        // Non-empty array - add comma and item
        return content.slice(0, insertPos) +
               ',\n' + serializedItem + '\n' +
               content.slice(insertPos);
    }
}

/**
 * Safely write to config file with backup and validation
 */
export async function safeWriteConfig(
    configPath: string,
    modifyFn: (content: string) => string
): Promise<void> {
    const backupPath = configPath + '.bak';
    const content = fs.readFileSync(configPath, 'utf8');

    // Create backup
    fs.writeFileSync(backupPath, content, 'utf8');

    try {
        const newContent = modifyFn(content);
        fs.writeFileSync(configPath, newContent, 'utf8');

        // Validate by attempting to load the config
        await importTypescript(configPath);

        // Success - remove backup
        fs.unlinkSync(backupPath);
    } catch (error) {
        // Restore from backup
        fs.copyFileSync(backupPath, configPath);
        fs.unlinkSync(backupPath);
        throw error;
    }
}

/**
 * Add a new source to the config file
 */
export async function addSourceToConfig(
    configPath: string,
    source: ConfigSource
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);
        const sourcesBoundary = boundaries.get('sources');

        if (!sourcesBoundary) {
            throw new Error('Could not find sources array in config file');
        }

        const serialized = serializeSource(source);
        return insertIntoArray(content, sourcesBoundary, serialized);
    });
}

/**
 * Add a new query to the config file
 */
export async function addQueryToConfig(
    configPath: string,
    query: ConfigQuery
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);
        const queriesBoundary = boundaries.get('queries');

        if (!queriesBoundary) {
            throw new Error('Could not find queries array in config file');
        }

        const serialized = serializeQuery(query);
        return insertIntoArray(content, queriesBoundary, serialized);
    });
}

/**
 * Add a new feed to the config file
 */
export async function addFeedToConfig(
    configPath: string,
    feed: ConfigFeed
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);
        const feedsBoundary = boundaries.get('feeds');

        if (!feedsBoundary) {
            throw new Error('Could not find feeds array in config file');
        }

        const serialized = serializeFeed(feed);
        return insertIntoArray(content, feedsBoundary, serialized);
    });
}

/**
 * Add both a query and its corresponding feed to the config file
 */
export async function addQueryAndFeedToConfig(
    configPath: string,
    query: ConfigQuery
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);

        const queriesBoundary = boundaries.get('queries');
        if (!queriesBoundary) {
            throw new Error('Could not find queries array in config file');
        }

        const feedsBoundary = boundaries.get('feeds');
        if (!feedsBoundary) {
            throw new Error('Could not find feeds array in config file');
        }

        // Add query first
        const queryText = serializeQuery(query);
        let newContent = insertIntoArray(content, queriesBoundary, queryText);

        // Recalculate boundaries after query insertion
        const newBoundaries = findArrayBoundaries(newContent);
        const newFeedsBoundary = newBoundaries.get('feeds');

        if (!newFeedsBoundary) {
            throw new Error('Could not find feeds array after query insertion');
        }

        // Add feed
        const feed: ConfigFeed = { title: query.title, blocks: [query.title] };
        const feedText = serializeFeed(feed);
        return insertIntoArray(newContent, newFeedsBoundary, feedText);
    });
}

/**
 * Add a new block (digester) to the config file
 */
export async function addBlockToConfig(
    configPath: string,
    block: ConfigBlock
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);
        const blocksBoundary = boundaries.get('blocks');

        if (!blocksBoundary) {
            throw new Error('Could not find blocks array in config file');
        }

        const serialized = serializeBlock(block);
        return insertIntoArray(content, blocksBoundary, serialized);
    });
}

/**
 * Add a new feed to the config file (standalone, for FeedEditor)
 */
export async function addFeedOnlyToConfig(
    configPath: string,
    feed: ConfigFeed
): Promise<void> {
    await safeWriteConfig(configPath, (content) => {
        const boundaries = findArrayBoundaries(content);
        const feedsBoundary = boundaries.get('feeds');

        if (!feedsBoundary) {
            throw new Error('Could not find feeds array in config file');
        }

        const serialized = serializeFeed(feed);
        return insertIntoArray(content, feedsBoundary, serialized);
    });
}
