/**
 * طبقة التخزين المحلي.
 * كل جزء من البيانات (المواد، الجدول، المهام، ...) بيتخزن في مفتاح لوحده في AsyncStorage
 * (على الويب بيبقى localStorage)، فأي تعديل بيتحفظ فوراً من غير مانكتب كل البيانات من الأول.
 *
 * لو حبينا ننقل لـ expo-sqlite أو Supabase بعدين، بنغيّر الملف ده بس.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppData, CollectionKey } from '@/lib/types';

import { emptyData } from './defaults';
import { parseAppData } from './validate';

const PREFIX = '@mozakrati/v1/';

/** المفاتيح اللي بتتخزن (version مابيتخزنش لوحده) */
export const STORED_KEYS: Exclude<CollectionKey, 'version'>[] = [
  'profile',
  'settings',
  'terms',
  'currentTermId',
  'subjects',
  'classes',
  'exams',
  'tasks',
  'studySessions',
  'pomodoro',
];

const storageKey = (k: CollectionKey) => PREFIX + k;

export async function loadAll(): Promise<AppData> {
  const pairs = await AsyncStorage.multiGet(STORED_KEYS.map(storageKey));
  const raw: Record<string, unknown> = {};
  let found = false;
  pairs.forEach(([key, value]) => {
    if (value == null) return;
    try {
      raw[key.slice(PREFIX.length)] = JSON.parse(value);
      found = true;
    } catch {
      // مفتاح بايظ: هيتشال ويرجع للقيمة الافتراضية
    }
  });
  if (!found) return emptyData();
  try {
    return parseAppData({ ...raw, profile: raw.profile ?? {} });
  } catch {
    return emptyData();
  }
}

/** الكتابة بالترتيب علشان آخر قيمة هي اللي تتحفظ */
let queue: Promise<unknown> = Promise.resolve();

export function saveKey<K extends CollectionKey>(key: K, value: AppData[K]): Promise<void> {
  const task = queue.then(() => AsyncStorage.setItem(storageKey(key), JSON.stringify(value)));
  queue = task.catch(() => undefined);
  return task;
}

export async function saveAll(data: AppData): Promise<void> {
  await queue;
  await AsyncStorage.multiSet(STORED_KEYS.map((k) => [storageKey(k), JSON.stringify(data[k])]));
}

export async function clearAll(): Promise<void> {
  await queue;
  await AsyncStorage.multiRemove(STORED_KEYS.map(storageKey));
}
