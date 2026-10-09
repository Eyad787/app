import type { AppData } from '@/lib/types';

import { parseAppData } from './validate';

export const BACKUP_APP_ID = 'mozakrati';

export function backupFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `mozakrati-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

export function serializeBackup(data: AppData): string {
  return JSON.stringify({ app: BACKUP_APP_ID, exportedAt: new Date().toISOString(), ...data }, null, 2);
}

/** بيرمي Error برسالة عربي لو الملف مش سليم */
export function parseBackup(text: string): AppData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  return parseAppData(raw);
}
