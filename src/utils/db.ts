import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { UserProgress } from '@/types/global';

interface LiterateDB extends DBSchema {
  progress: {
    key: string;
    value: UserProgress;
  };
}

const DB_NAME = 'literate-adventure-db';
const STORE = 'progress';
const KEY = 'default-user';

let dbPromise: Promise<IDBPDatabase<LiterateDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LiterateDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadProgress(): Promise<UserProgress | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE, KEY);
    return data ?? null;
  } catch (e) {
    console.warn('[DB] loadProgress failed', e);
    return null;
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE, { ...progress, updatedAt: Date.now() }, KEY);
  } catch (e) {
    console.warn('[DB] saveProgress failed', e);
  }
}

export async function clearProgress(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE, KEY);
  } catch (e) {
    console.warn('[DB] clearProgress failed', e);
  }
}
