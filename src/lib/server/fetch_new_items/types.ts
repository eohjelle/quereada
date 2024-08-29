import type { Source } from '@prisma/client';
import type { Item, Author } from '@prisma/client';

export interface SourceWithFetch extends Partial<Source> {
    name: string;
    channels?: string[];
    
    fetch_new_items(): Promise<Array<[Item,Author[]]>>;
}