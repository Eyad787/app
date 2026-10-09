/** تصدير واستيراد النسخة الاحتياطية على الموبايل */
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { AppData } from '@/lib/types';

import { backupFileName, parseBackup, serializeBackup } from './backupFormat';

export async function exportBackup(data: AppData): Promise<void> {
  const file = new File(Paths.cache, backupFileName());
  if (file.exists) file.delete();
  file.create();
  file.write(serializeBackup(data));
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save backup',
    UTI: 'public.json',
  });
}

/** بيرجّع البيانات أو null لو المستخدم لغى */
export async function importBackup(): Promise<AppData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const text = await new File(result.assets[0].uri).text();
  return parseBackup(text);
}
