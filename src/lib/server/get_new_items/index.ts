export function get_new_items() {
  return 'Hello from get_new_items';
}

export type ItemType = 'Link' | 'FullTextArticle';

export type Item = {
    title: string;
    url: string;
    type: ItemType;
    date: string;
    source: string;
};

export interface Source {
    name: string;
    url: string;
    channels?: string[];

    async fetch_new_items(): Promise<Item[]>;
};