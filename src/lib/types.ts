import type { Item as PrismaItem, Author, Prisma } from '@prisma/client';
import type { Filter } from '$root/modules/filters';

/** The type of item_type in the Item model. It affects how the item is displayed (each item type has a different Svelte component). */
export type ItemType = 'Link' | 'Article';


// // Because Prisma's generated types have null values instead of undefined values (used for optional fields), 
// // we use the following 3 utility types to convert keys with nullable types into optional fields.
// // Credit: https://stackoverflow.com/questions/72165227/how-to-make-nullable-properties-optional-in-typescript
// type PickNullable<T> = {
//     [P in keyof T as null extends T[P] ? P : never]: T[P]
// }
  
// type PickNotNullable<T> = {
//     [P in keyof T as null extends T[P] ? never : P]: T[P]
// }

// export type NullableToOptional<T> = {
//     [K in keyof PickNullable<T>]?: Exclude<T[K], null>
// } & {
//     [K in keyof PickNotNullable<T>]: T[K]
// }

// // This is the type of item with all the fields. 
// export type Item = NullableToOptional<PrismaItem> & {
//     authors: Author[];
//     checked_filters: Filter[];
//     passed_filters: Filter[];
// };


/** This is the type of object that is passed into the Prisma client's create method */
export type InsertItem = Prisma.ItemCreateInput;

/** These are the fields that must be set when fetching items in the source.fetchItems() method. However, many of these fields are optional. */
const mandatoryFetchItemFields = ['title', 'description', 'link', 'authors', 'date_published', 'likes', 'comments_link', 'content', 'image_link', 'image_caption', 'image_credit'] as const;
type MandatoryFetchItemFields = typeof mandatoryFetchItemFields[number];

/** These are the fields that are used by the application and should not be set while fetching items. */
type UtilityItemFields = 'id' | 'date_added' | 'seen' | 'read_later' | 'saved' | 'clicked' | 'checked_filters' | 'passed_filters'; 

/** This is the type returned by source.fetchItems() */
export type FetchItem = Pick<InsertItem, MandatoryFetchItemFields> 
    & Partial<Omit<InsertItem, MandatoryFetchItemFields | UtilityItemFields>>;

/** This is the type returned by Prisma's client with all fields. */
export type Item = Prisma.ItemGetPayload<{
    include: { authors: true, checked_filters: true, passed_filters: true }
}>

/** When passing items to the client for display, we use the following type. 
 * The block_title field is used to store the title of the block that contains the item.
 */
export type DisplayItem = Pick<
    Item, 
    'id' | 'item_type' | 'source_name' | 'title' | 'description' | 'link' | 'authors' | 'date_published' | 'image_link' | 'image_caption' | 'image_credit' | 'number_of_words' | 'likes' | 'comments_link'
    | 'seen' | 'read_later' | 'saved' | 'summarizable'
> & { feed_title: string, block_title: string };

/** The type used for summarization. */
export type ItemToSummarize = Pick<
    Item, 
    'source_name' | 'title' | 'authors' | 'description' | 'content'
>;

/** The type Author is the type returned by the Prisma client. */
export { type Author } from '@prisma/client';

/** The type Block is the type returned by the Prisma client with the parsed version of the query and args fields. */
export type Block = Omit<Prisma.BlockGetPayload<{}>, 'query' | 'args'>
    & { query: Prisma.ItemFindManyArgs }
    & { args: Record<string, any> | null };

/** Helper to check if a block is a digest block (implementation !== "ItemsStream") */
export function isDigestBlock(block: Block): boolean {
    return block.implementation !== 'ItemsStream';
}

/** The type Feed is the type returned by the Prisma client with the parsed version of the query field inside each Block. */
export type Feed = Prisma.FeedGetPayload<{}> & { blocks: Block[] };

/** The type of items passed to digesters for processing */
export type DigestItem = Pick<
    Item,
    'id' | 'title' | 'description' | 'source_name' | 'date_published' | 'content' | 'link'
> & { authors: Author[] };

/** The type of items returned for inline display in digests - matches DisplayItem structure */
export type DigestDisplayItem = Pick<
    Item,
    'id' | 'item_type' | 'source_name' | 'title' | 'description' | 'link' | 'date_published'
    | 'image_link' | 'image_caption' | 'image_credit' | 'number_of_words' | 'likes' | 'comments_link'
    | 'seen' | 'read_later' | 'saved' | 'summarizable'
> & { authors: Author[] };

/** The type Filter is the type returned by the Prisma client. */
export type PrismaFilter = Prisma.FilterGetPayload<{}>;


export type ItemWithFiltersChecked = Prisma.ItemGetPayload<{include: {filters_checked: true}}>