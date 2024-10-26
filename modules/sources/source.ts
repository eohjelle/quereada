import { type Source as PrismaSource, Prisma } from '@prisma/client';
import type { ItemType, FetchItem, InsertItem, ItemToSummarize } from '$lib/types';
import { db } from '$src/backend/database';
import { authorListToConnectOrCreateField } from '$lib/utils';
import { summarize } from '$src/backend/summarize';


/** The fields that (may) have default values set in the source class. */
const defaultItemFields = ['item_type', 'language', 'authors', 'summarizable'] as const;
type DefaultItemFields = typeof defaultItemFields[number];

/** The type of the parameters for the constructor of a Source class. */
export type SourceConstructorParams<T extends Record<string, any> = {}> = {
    name: string;
    args?: T;
    default_values?: {
        item_type?: ItemType;
        lang_id?: string;
        authors?: string[];
        summarizable?: boolean;
    };
}

/** A basic type that the Source class implements. */
type SourceType<T extends Record<string, any> | undefined = undefined> = 
    Omit<PrismaSource, 'implementation' | 'date_added' | 'args' | 'default_values'> 
    & { 
        args: T, 
        default_values: Partial<Pick<InsertItem, DefaultItemFields>> 
    }

/** This is the class that all sources must implement. */
export abstract class Source<T extends Record<string, any> = {}> implements SourceType<T> {
    name: string;
    args: T;
    default_values: Partial<Pick<InsertItem, DefaultItemFields>>; // Default values for item fields that are not set in the fetchItemsFromSource method.

    constructor({ name, args, default_values }: SourceConstructorParams<T>) {
        this.name = name;
        this.args = args ?? {} as T;
        const { item_type, lang_id, authors, summarizable } = default_values || {};
        this.default_values = {
            item_type: item_type,
            language: lang_id 
                ? {
                    connectOrCreate: {
                        where: { id: lang_id },
                        create: { id: lang_id }
                    }
                } 
                : undefined,
            authors: authors 
                ? authorListToConnectOrCreateField(authors)
                : undefined,
            summarizable: summarizable
        }
    }

    protected abstract fetchItemsFromSource (): Promise<FetchItem[]>;

    /** Get the value of an item field, using the default value if the field is not set */
    protected getItemValueOrDefaultValue<K extends DefaultItemFields>(
        item: FetchItem,
        key: K
    ): InsertItem[K] {
        const value = item[key] ?? this.default_values[key];
        if (value) {
            return value;
        } else if (['language', 'authors'].includes(key)) {
            // InsertItem allows some keys to be undefined
            return undefined; 
        } else if (key === 'summarizable') {
            // If the item has content, the Source class has a default implementation of summarizeItem.
            return (item.content ? true : false) as InsertItem[K]; 
        } else {
            throw new Error(
                `Item ${item.title} is missing value for key ${key}. Either set a default value in the source class ${this.name} or make sure the value is set in the fetchItemsFromSource method.`
            );
        }
    }

    protected async pushItemToDatabase(item: FetchItem): Promise<void> {
        // Mold item into the format expected by Prisma
        const insertItem: InsertItem = {
            source: { connect: { name: this.name } }, // The source is dictated by the Source class
            ...item, // Copy all fields from item
            ...Object.fromEntries(defaultItemFields.map(key => [key, this.getItemValueOrDefaultValue(item, key)])) // Set default values
        };
        try {
            await db.item.upsert({
                where: {
                    link: item.link
                },
                update: insertItem,
                create: insertItem
            })
        } catch (error) {
            // Multiple concurrent connectOrCreate requests can cause a P2002 error: https://www.prisma.io/docs/orm/reference/prisma-client-reference#connectorcreate 
            // Following Prisma's recommendation, we catch the error and try again.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                console.error(`Caught P2002 error for item ${item.title} from source ${this.name}. This is likely because two concurrent requests are trying to add the same item to the database. See https://www.prisma.io/docs/orm/reference/prisma-client-reference#connectorcreate for more information. Waiting 100 milliseconds and trying again...`);
                await new Promise(resolve => setTimeout(resolve, 100));
                await this.pushItemToDatabase(item);
            } else {
                console.error(`Error pushing item to database: ${error}`);
                throw error;
            }
        }
    }

    /** Fetch items from the source and push them to the database. This is called by fetchItemsFromSources() in src/backend/fetch.ts */
    async fetchItemsAndPushToDatabase(): Promise<void> {
        const items = await this.fetchItemsFromSource();
        await Promise.all(items.map(item => this.pushItemToDatabase(item)));
    }

    /** This method can be overriden by a subclass to provide a custom method of summarizing items.
     * The default implementation is to use the summarize function in src/backend/summarize.ts, based on the item's content field.
     */
    async summarizeItem(item: ItemToSummarize): Promise<ReadableStream<string>> {
        if (!item.content) {
            throw new Error(`Item ${item.title} has no content, so it cannot be summarized using the default summarizeItem method.`);
        }
        return summarize(item);
    }
}