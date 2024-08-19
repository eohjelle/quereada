import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import fs from 'fs';

console.log('DB_PATH:', DB_PATH); // For debugging purposes. todo: remove

export const db = new Database(DB_PATH);
db.exec(fs.readFileSync('seed.sql', 'utf8'));

export async function query(sql: string, params?: any[]) {
  return db.prepare(sql).all(params);
}