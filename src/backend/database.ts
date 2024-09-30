import { PrismaClient } from '@prisma/client';

console.log(`Loading database at ${process.env.DATABASE_URL}...`);

export const db = new PrismaClient();