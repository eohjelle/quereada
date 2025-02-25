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
app.setPath('sessionData', path.join(app.getPath('userData'), 'session')); // Make the userData folder look less scary
const RESOURCES_PATH = import.meta.env.DEV ? path.resolve(process.cwd()) : process.resourcesPath; // Contains templates for the database and config file.

// Load API keys from CONFIG_FOLDER/keys.json
const keysPath = path.join(CONFIG_FOLDER, 'keys.json');
if (fs.existsSync(keysPath)) {
    const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    for (const [key, value] of Object.entries(keys)) {
        if (typeof value === 'string') {
            process.env[key] = value;
        } else {
            console.warn(`Skipping non-string value for key "${key}" in keys.json`);
        }
    }
}

// Load database from CONFIG_FOLDER/store.db, initializing an empty one if it doesn't exist.
// If in development mode, look for the database file in the root folder of the project instead.
let dbPath: string;
if (import.meta.env.PROD) {
    dbPath = path.join(CONFIG_FOLDER, 'store.db');
    if (!fs.existsSync(dbPath)) {
        try {
            console.log(`Could not find database at ${dbPath}, copying from resources...`);
            fs.copyFileSync(path.join(RESOURCES_PATH, 'store.db'), dbPath);
            console.log(`Database file copied to ${dbPath}!`);
        } catch (error) {
            throw new Error(`Error copying database file: ${error}`);
        }
    }
} else {
    dbPath = path.join(path.resolve(process.cwd()), 'store.db');
}

process.env['DATABASE_URL'] = `file://${dbPath}`;
console.log(`Set DATABASE_URL to ${process.env['DATABASE_URL']}`);

// Set CONFIG_PATH to CONFIG_FOLDER/config.ts, copying a template if it doesn't exist.
// If in development mode, look for the config file in the root folder of the project instead.
let configPath: string;
if (import.meta.env.PROD) {
    configPath = path.join(CONFIG_FOLDER, 'quereada.config.ts');
    if (!fs.existsSync(configPath)) {
        try {
            console.log(`Could not find config at ${configPath}, copying template from resources...`);
            fs.copyFileSync(path.join(RESOURCES_PATH, 'quereada.config.ts'), configPath);
            console.log(`Config file template copied to ${configPath}!`);
        } catch (error) {
            throw new Error(`Error copying config file: ${error}`);
        }
    }
} else {
    configPath = path.join(path.resolve(process.cwd()), 'quereada.config.ts');
}

process.env['CONFIG_PATH'] = configPath;
console.log(`Set CONFIG_PATH to ${process.env['CONFIG_PATH']}`);

console.log(`Resources path: ${process.resourcesPath}`);


// Set ELECTRON_RENDERER_URL to the default port if it's not already set
if (import.meta.env.DEV && !process.env['ELECTRON_RENDERER_URL']) {
    process.env['ELECTRON_RENDERER_URL'] = `http://localhost:5173`;
}