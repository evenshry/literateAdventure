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
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<LiterateDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LiterateDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // 版本升级迁移策略
        if (oldVersion < 2) {
          // v2: 添加 schemaVersion 标识，并确保所有 charProgress 有 wrongCount 字段
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE);
          }
        }
      },
    });
  }
  return dbPromise;
}

/**
 * 对加载的数据做运行时迁移
 * 确保新字段有默认值，防止老用户数据缺失字段导致运行时错误
 */
function migrateProgress(progress: UserProgress): UserProgress {
  const migratedCharProgress: UserProgress['charProgress'] = {};

  for (const [char, cp] of Object.entries(progress.charProgress)) {
    migratedCharProgress[char] = {
      ...cp,
      // v2: 新增 wrongCount 字段，老数据默认为 0
      wrongCount: cp.wrongCount ?? 0,
    };
  }

  return {
    ...progress,
    charProgress: migratedCharProgress,
  };
}

export async function loadProgress(): Promise<UserProgress | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE, KEY);
    if (!data) return null;
    // 对老数据进行运行时迁移
    return migrateProgress(data);
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
