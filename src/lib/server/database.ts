import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private';

console.log(`Loading database at ${DATABASE_URL}...`);

export const db = new PrismaClient();