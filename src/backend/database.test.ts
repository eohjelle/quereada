import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from './database';
import { omitKeysFromObject } from '$lib/utils';

describe('Database Tests', () => {
    it('should retrieve items', async () => {
        const items = await db.item.findMany({
            orderBy: { id: 'asc' },
            take: 10
        });
        expect(items).toBeDefined();
        expect(items).toHaveLength(10); // Will fail if there are actually less than 10 items in the database!
    });

    it('should retrieve items with vacuous where clause', async () => {
        // This kind of query is used in the pull method of ItemsStream
        const items = await db.item.findMany({
            where: {
                OR: [
                    { id: { gte: 0 } },
                    {
                        AND: [
                            {},
                            { OR: [] }
                        ]
                    }
                ]
            },
            take: 10
        });
        expect(items).toBeDefined();
        expect(items).toHaveLength(10);
    });
});
