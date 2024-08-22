import type { Author, Item, Source } from '@prisma/client';

type ItemType = "Link" | "FullTextArticle"; // Would be better to have this as an enum in the Prisma schema, but the sqlite provider doesn't support enums. todo: change if moving to different database provider.

export interface ItemExtended extends Item {
    item_type: ItemType;
    author_names: string[];
    authors:    { connectOrCreate: Array<{ where: { name: string }, create: { name: string } }> };
}

export interface SourceWithFetch extends Source {
    fetch_new_items(): Promise<Array<[Item,Author[]]>>;
}