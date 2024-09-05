import fs from 'fs';

const configPath = 'config.ts';

export async function load() {
    const config = fs.readFileSync(configPath, 'utf8');
    return { config };
}