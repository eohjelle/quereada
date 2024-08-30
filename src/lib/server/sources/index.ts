import { SourceWithFetch } from '../types';

// Import source classes and create a dictionary mapping the source_type field to the correct class
// todo: create more dynamic import of the source classes. 
import { TheAtlantic } from './the_atlantic'; 
import { RSS } from './rss';
import { NYTimesAPI } from './nytimes';

export const sourceClasses: { [key: string]: new (...args: any[]) => SourceWithFetch } = {
    'TheAtlantic': TheAtlantic,
    'RSS': RSS,
    'NYTimesAPI': NYTimesAPI,
}