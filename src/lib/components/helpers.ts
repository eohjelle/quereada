type Author = { name: string };

export function byline (authors: Author[]) {
    const names = authors.map(author => author.name);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return names.slice(0, -1).join(', ') + `, and ${names.slice(-1)}`;
}