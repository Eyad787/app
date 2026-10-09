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

const daysWord = (n: number) => countWord(n, 'يوم', 'يومين', 'أيام', 'يوم');

/** "النهارده" / "بكرة" / "فاضل 5 أيام" / "فات من 3 أيام" */
export function countdownLabel(target: DateKey, today: DateKey): string {
  const d = daysLeft(target, today);
  if (d === 0) return 'النهارده';
  if (d === 1) return 'بكرة';
  if (d === -1) return 'كان امبارح';
  if (d < 0) return `فات من ${daysWord(-d)}`;
  return `فاضل ${daysWord(d)}`;
}
