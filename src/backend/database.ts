import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL || 'file:./store.db';
console.log(`Loading database at ${databaseUrl}...`);

export const db = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    },
    log: ['warn', 'error']
});