import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

const client = new MongoClient(env.mongodbUri);
let db;

export async function connectDb() {
  if (db) return db;
  await client.connect();
  db = client.db();
  return db;
}

export function getDb() {
  if (!db) throw new Error('getDb() ถูกเรียกก่อน connectDb() — ต้องต่อฐานข้อมูลก่อน');
  return db;
}

export async function closeDb() {
  await client.close();
  db = undefined;
}
