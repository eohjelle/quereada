import { app } from "electron";
import log from "electron-log";
import path from "path";
import fs from "fs";

// Enable logging. Logs can be found in ~/Library/Logs/quereada on macOS, and inside the userData directory on Linux and Windows.

console.log = log.info;
console.warn = log.warn;
console.error = log.error;
console.debug = log.debug;

// The electron build handles environmental variables differently than the web build.
// Instead of setting environmental variables, all configuration is stored in the userData directory.
const CONFIG_FOLDER = app.getPath('userData');
app.setPath('sessionData', path.join(CONFIG_FOLDER, 'session')); // Make the userData folder look less scary
const RESOURCES_PATH = import.meta.env.DEV ? path.resolve(process.cwd()) : process.resourcesPath; // Contains templates for the database and config file.

// Load API keys from CONFIG_FOLDER/api_keys.json
const apiKeysPath = path.join(CONFIG_FOLDER, 'api_keys.json');
if (fs.existsSync(apiKeysPath)) {
    const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf8'));
    for (const [key, value] of Object.entries(apiKeys)) {
        if (typeof value === 'string') {
            process.env[key] = value;
        } else {
            console.warn(`Skipping non-string value for key "${key}" in api_keys.json`);
        }
    }
}

// Load database from CONFIG_FOLDER/store.db, initializing an empty one if it doesn't exist
const dbPath = path.join(CONFIG_FOLDER, 'store.db');

if (!fs.existsSync(dbPath)) {
try {
    console.log(`Could not find database at ${dbPath}, copying from resources...`);
    fs.copyFileSync(path.join(RESOURCES_PATH, 'store.db'), dbPath);
    console.log(`Database file copied to ${dbPath}!`);
} catch (error) {
    throw new Error(`Error copying database file: ${error}`);
}
}

process.env['DATABASE_URL'] = `file://${dbPath}`;
console.log(`Set DATABASE_URL to ${process.env['DATABASE_URL']}`);

// Set CONFIG_PATH to CONFIG_FOLDER/config.ts, copying a template if it doesn't exist
const configPath = path.join(CONFIG_FOLDER, 'config.ts');
if (!fs.existsSync(configPath)) {
    try {
        console.log(`Could not find config at ${configPath}, copying template from resources...`);
        fs.copyFileSync(path.join(RESOURCES_PATH, 'quereada.config.ts'), configPath);
        console.log(`Config file template copied to ${configPath}!`);
    } catch (error) {
        throw new Error(`Error copying config file: ${error}`);
    }
}

process.env['CONFIG_PATH'] = configPath;
console.log(`Set CONFIG_PATH to ${process.env['CONFIG_PATH']}`);

console.log(`Resources path: ${process.resourcesPath}`);