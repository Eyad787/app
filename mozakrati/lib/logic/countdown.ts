import type { DateKey } from '@/lib/types';

import { countWord, diffDays } from './dates';

export type Urgency = 'past' | 'urgent' | 'soon' | 'normal';

/** عدد الأيام الفاضلة (تقويمياً) من النهارده لحد التاريخ */
export function daysLeft(target: DateKey, today: DateKey): number {
  return diffDays(today, target);
}

/** أحمر لو فاضل أقل من 3 أيام */
export function urgencyOf(target: DateKey, today: DateKey): Urgency {
  const d = daysLeft(target, today);
  if (d < 0) return 'past';
  if (d < 3) return 'urgent';
  if (d <= 7) return 'soon';
  return 'normal';
}

const daysWord = (n: number) => countWord(n, 'day');

/** "Today" / "Tomorrow" / "In 5 days" / "3 days ago" */
export function countdownLabel(target: DateKey, today: DateKey): string {
  const d = daysLeft(target, today);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0) return `${daysWord(-d)} ago`;
  return `In ${daysWord(d)}`;
}
