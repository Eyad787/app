import { sortByNewest } from './calculations';
import type { CategoryId, Expense } from './types';

function escapeCell(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * بيحوّل المصاريف لنص CSV.
 * بيبدأ بـ BOM عشان Excel يقرا العربي صح.
 */
export function expensesToCsv(
  expenses: Expense[],
  categoryLabels: Record<CategoryId, string>,
  currency: string,
): string {
  const header = ['التاريخ', 'النوع', 'المبلغ', 'العملة', 'الملاحظة', 'وقت الإضافة'];
  const rows = sortByNewest(expenses).map((e) => [
    e.date,
    categoryLabels[e.category] ?? e.category,
    e.amount,
    currency,
    e.note,
    e.createdAt,
  ]);
  const lines = [header, ...rows].map((row) => row.map(escapeCell).join(','));
  return `﻿${lines.join('\r\n')}\r\n`;
}
