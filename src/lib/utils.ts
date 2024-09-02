type Author = { name: string };

// Given an array of authors, return a byline string
export function byline (authors: Author[]) {
    const names = authors.map(author => author.name);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return names.slice(0, -1).join(', ') + `, and ${names.slice(-1)}`;
}

// Given a nested object, return an (flattened) array of all unique values in the object
// Example: get_values({ a: { b: 1, c: { d: [1, 2] } } }) => [1, 2]
export function get_values(obj: any): any[] {
	let values: any[] = [];
	function recurse(subObj: any) {
		if (typeof subObj == 'object' && subObj !== null) {
			for (const key in subObj) {
				if (subObj.hasOwnProperty(key)) {
					recurse(subObj[key]);
				}
			}
		} else {
			values.push(subObj);
		}
	}
	recurse(obj);
    return Array.from(new Set(values.flat()));
}

// Get the cartesian product of two arrays
export function cartesian_product<T>(a: T[], b: T[]): [T, T][] {
	return a.flatMap(x => b.map(y => [x, y] as [T, T]));
}