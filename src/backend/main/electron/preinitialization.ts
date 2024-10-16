import { app } from "electron";
import log from "electron-log";
import path from "path";
import fs from "fs";

const CONFIG_FOLDER = app.getPath('userData');
app.setPath('sessionData', path.join(CONFIG_FOLDER, 'session')); // Make the userData folder look less scary

// Enable logging. Logs can be found in ~/Library/Logs/querygator on macOS, and inside the userData directory on Linux and Windows.

console.log = log.info;
console.warn = log.warn;
console.error = log.error;
console.debug = log.debug;

// console.log('These are the environment variables:');
// console.log(process.env);


// Load all environmental variables into process.env which is where the web build expects them to be
for (const [key, value] of Object.entries(import.meta.env)) {
    console.log(`Setting environment variable ${key} to ${value}`);
    process.env[key] = value;
}

// process.env['MODE'] = 'electron';
  
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
const dbPath = (() => {
if (app.isPackaged) {
    return path.join(CONFIG_FOLDER, 'store.db');
} else {
    return path.join(process.cwd(), 'store.db');
}
})();

if (!fs.existsSync(dbPath)) {
try {
    console.log(`Could not find database at ${dbPath}, copying from resources...`);
    fs.copyFileSync(path.join(process.resourcesPath, 'store.db'), dbPath);
    console.log(`Database file copied to ${dbPath}!`);
} catch (error) {
    throw new Error(`Error copying database file: ${error}`);
}
}

process.env['DATABASE_URL'] = `file://${dbPath}`;
console.log(`Set DATABASE_URL to ${process.env['DATABASE_URL']}`);