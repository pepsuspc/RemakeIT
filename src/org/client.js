import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_MS = 10 * 60 * 1000; // 10 นาที

let cache = null; // { data, fetchedAt }

async function fetchFromMock() {
  const file = await readFile(path.join(__dirname, '../../mock/org/employees.json'), 'utf8');
  return JSON.parse(file).data;
}

export async function allEmployees() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.data;
  }

  let data;
  if (env.orgApiMock) {
    data = await fetchFromMock();
  } else {
    throw new Error('ยังไม่รองรับ org API จริง (จะทำในงานถัดไป)');
  }

  cache = { data, fetchedAt: Date.now() };
  return data;
}
