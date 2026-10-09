import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { CATEGORY_LABELS } from '@/constants/categories';

import { todayKey } from './dates';
import { expensesToCsv } from './csv';
import type { Expense } from './types';

/** بيكتب ملف CSV في الكاش ويفتح شاشة المشاركة */
export async function exportAndShareCsv(expenses: Expense[], currency: string): Promise<void> {
  const csv = expensesToCsv(expenses, CATEGORY_LABELS, currency);
  const file = new File(Paths.cache, `masarefy-${todayKey()}.csv`);
  file.create({ overwrite: true });
  file.write(csv);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('المشاركة مش متاحة على الجهاز ده');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: 'مشاركة المصاريف',
  });
}
