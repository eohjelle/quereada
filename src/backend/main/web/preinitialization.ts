import path from "path";

process.env['CONFIG_PATH'] = process.env['CONFIG_PATH'] || path.join(process.cwd(), 'querygator.config.ts');