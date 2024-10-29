import { describe, it, expect } from 'vitest';
import { byline, getValues, getValuesUnderKeys, omitKeysFromObject, cartesian_product, authorListToConnectOrCreateField, authorListFromByline } from './utils';
import type { Author } from './types';

describe('byline', () => {
    it('should return an empty string for an empty array', () => {
        expect(byline([])).toBe('');
    });

    it('should return a single name for an array with one author', () => {
        const authors: Author[] = [{ name: 'John Doe' }];
        expect(byline(authors)).toBe('John Doe');
    });

    it('should join two names with "and"', () => {
        const authors: Author[] = [
            { name: 'John Doe' },
            { name: 'Jane Smith' }
        ];
        expect(byline(authors)).toBe('John Doe and Jane Smith');
    });

    it('should join three or more names with commas and "and"', () => {
        const authors: Author[] = [
            { name: 'John Doe' },
            { name: 'Jane Smith' },
            { name: 'Bob Johnson' }
        ];
        expect(byline(authors)).toBe('John Doe, Jane Smith, and Bob Johnson');
    });

    it('should throw an error if authors is undefined or null', () => {
        expect(() => byline(undefined as any)).toThrow();
        expect(() => byline(null as any)).toThrow();
    });
});

describe('getValues', () => {
    it('should return an array of unique values from a nested object', () => {
        const obj = { a: { b: 1, c: { d: [1, 2] } } };
        expect(getValues(obj)).toEqual([1, 2]);
    });

    it('should handle empty objects', () => {
        expect(getValues({})).toEqual([]);
    });

    it('should handle arrays', () => {
        expect(getValues([1, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });
});

describe('getValuesUnderKeys', () => {
    it('should return values under specified keys', () => {
        const obj = { a: { b: 1, c: { d: [1, 2] }, e: { c: 5 }, f: 6 } };
        expect(getValuesUnderKeys(obj, ['a', 'c'])).toEqual([1, 2, 5]);
    });

    it('should return empty array if keys not found', () => {
        const obj = { a: { b: 1 } };
        expect(getValuesUnderKeys(obj, ['x', 'y'])).toEqual([]);
    });
});

describe('omitKeysFromObject', () => {
    it('should remove specified key from object', () => {
        const obj = { a: { b: 1, c: { d: [1, 2] } }, e: 3 };
        expect(omitKeysFromObject(obj, 'c')).toEqual({ a: { b: 1 }, e: 3 });
    });

    it('should return the same object if key not found', () => {
        const obj = { a: 1, b: 2 };
        expect(omitKeysFromObject(obj, 'c')).toEqual(obj);
    });
});

describe('authorListToConnectOrCreateField', () => {
    it('should convert an array of author names to Prisma connectOrCreate field', () => {
        const authors = ['John Doe', 'Jane Smith'];
        const result = authorListToConnectOrCreateField(authors);
        expect(result).toEqual({
            connectOrCreate: [
                { where: { name: 'John Doe' }, create: { name: 'John Doe' } },
                { where: { name: 'Jane Smith' }, create: { name: 'Jane Smith' } }
            ]
        });
    });
});

describe('authorListFromByline', () => {
    it('should convert a byline string to an array of author names', () => {
        expect(authorListFromByline('By John Doe and Jane Smith')).toEqual(['John Doe', 'Jane Smith']);
        expect(authorListFromByline('Byron Doe, Jane Smith, and Alexandra Johnson')).toEqual(['Byron Doe', 'Jane Smith', 'Alexandra Johnson']);
    });

    it('should handle bylines without "By" prefix', () => {
        expect(authorListFromByline('John Doe and Jane Smith')).toEqual(['John Doe', 'Jane Smith']);
    });

    it('should convert an empty byline to an empty array', () => {
        expect(authorListFromByline('')).toEqual([]);
    });
});