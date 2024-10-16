import type { Author } from './types';

// Given an array of authors, return a byline string
export function byline (authors: Author[]): string {
	if (authors === undefined || authors === null) {
		throw new Error('Authors array is undefined or null, so can not create a byline. Make sure to include authors in the query or use a Svelte component that does not require authors.')
	}
    const names = authors.map(author => author.name);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
	const result = names.slice(0, -1).join(', ') + `, and ${names.slice(-1)}`;
    return result;
}

// Given a nested object, return an (flattened) array of all unique values in the object
// Example: get_values({ a: { b: 1, c: { d: [1, 2] } } }) => [1, 2]
export function getValues(obj: any): any[] {
	let values: any[] = [];
	function recurse(subObj: any) {
		if (typeof subObj == 'object' && subObj !== null) {
			for (const key in subObj) {
				if (subObj.hasOwnProperty(key)) {
					recurse(subObj[key]);
				}
			}
		} else if (!values.includes(subObj)) {
			values.push(subObj);
		}
	}
	recurse(obj);
    return Array.from(new Set(values.flat()));
}

/** Given a nested object and a chain of nested values, return a flattened array consisting of the unique values
 * at the end of the chains extending the chain of keys.
 * 
 * Example: getValuesAtKey({ a: { b: 1, c: { d: [1, 2] } } }, ['a', 'c']) => [1, 2]
 */ // todo: make sure the types are correct.
export function getValuesUnderKeys(obj: Record<string, any>, keys: string[]): any[] {
    let values: any[] = [];
	function recurse(subObj: any, keys: string[]) {
		if (typeof subObj == 'object' && subObj !== null && subObj !== undefined) {
			for (const key in subObj) {
				if (subObj.hasOwnProperty(key)) {
					const newKeys = keys.length > 0 ? key === keys[0] ? keys.slice(1) : keys : [];
					recurse(subObj[key], newKeys);
				}
			}
		} else if (!values.includes(subObj) && keys.length === 0) {
			values.push(subObj);
		}
	}
	recurse(obj, keys);
	return values;
}

/** Given an object, traverse it and return a shallow copy with all key-value pairs corresponding to the given key removed.
 * 
 * Example: omitFromObject({ a: { b: 1, c: { d: [1, 2] } }, e: 3 }, 'c') => { a: { b: 1 }, e: 3 }
 */
export function omitKeysFromObject(obj: Record<string, any>, key: string): Record<string, any> {
	function recurse(obj: Record<string, any>, key: string) {
		if (obj.hasOwnProperty(key)) {
			delete obj[key];
		}
		for (const subObj of Object.values(obj)) {
			if (typeof subObj === 'object' && subObj !== null) {
				recurse(subObj, key);
			}
		}
		return obj; 
	}
	return recurse({ ...obj }, key);
}


// Get the cartesian product of two arrays
export function cartesian_product<T>(a: T[], b: T[]): [T, T][] {
	return a.flatMap(x => b.map(y => [x, y] as [T, T]));
}

// Convert an array of author names to a Prisma connectOrCreate field
import type { Prisma } from '@prisma/client';
export function authorListToConnectOrCreateField(authors: string[]): Prisma.AuthorCreateNestedManyWithoutItemsInput {
	return {
		connectOrCreate: authors.map(author => ({
			where: { name: author },
			create: { name: author }
		}))
	};
}

// Convert a byline string to an array of author names
export function authorListFromByline(byline: string): string[] {
    return byline
        .replace('By ', '') // remove "By" from the beginning of the byline
        .replace(' and ', ',') // replace "and" with ","
        .split(',') // split the byline into an array of names
        .map(name => name.trim()) // trim whitespace from each name
        .filter(name => name !== '') // remove any empty strings
}