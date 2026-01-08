import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { configUtilities } from './config-utils';

// Register config utilities as globals so they're available to config files
for (const [name, value] of Object.entries(configUtilities)) {
    (globalThis as Record<string, unknown>)[name] = value;
}

/** Compile a typescript file to a javascript file in a temporary folder and dynamically import it. */
export async function importTypescript(filePath: string) {
    // Read the TypeScript config file
    const tsCode = fs.readFileSync(filePath, 'utf8');

    // Compile the TypeScript code to JavaScript
    const result = ts.transpileModule(tsCode, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS, // Use CommonJS module system
            target: ts.ScriptTarget.ESNext, // Target ESNext for async/await support if needed
        }
    });

    // Generate a temporary file path for the compiled JavaScript
    const tempJsPath = path.join(
        os.tmpdir(),
        `${path.basename(filePath)}.${Date.now()}.js`
    );

    try {
        // Write the compiled JavaScript code to the temporary file
        fs.writeFileSync(tempJsPath, result.outputText);

        // Import the compiled JavaScript code
        const imported = await import(tempJsPath);
        return imported;
    } finally {
        // Delete the temporary file after importing
        fs.unlinkSync(tempJsPath);
    }
}
