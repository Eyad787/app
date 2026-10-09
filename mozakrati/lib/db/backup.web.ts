/** تصدير واستيراد النسخة الاحتياطية على المتصفح */
import type { AppData } from '@/lib/types';

import { backupFileName, parseBackup, serializeBackup } from './backupFormat';

export async function exportBackup(data: AppData): Promise<void> {
  const blob = new Blob([serializeBackup(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importBackup(): Promise<AppData | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        resolve(parseBackup(await file.text()));
      } catch (e) {
        reject(e);
      }
    };
    input.click();
  });
}
