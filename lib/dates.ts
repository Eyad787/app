import type { DateKey, MonthKey } from './types';

export const MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/** مرتبة حسب Date.getDay(): الأحد = 0 */
export const DAY_NAMES = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];

/** الأسبوع في مصر بيبدأ يوم السبت */
export const WEEK_START_DAY = 6;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidDateKey(key: unknown): key is DateKey {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toDateKey(parseDateKey(key)) === key;
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${pad(month + 1)}`;
}

export function monthKeyOf(key: DateKey): MonthKey {
  return key.slice(0, 7);
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m - 1 };
}

export function addMonths(key: MonthKey, delta: number): MonthKey {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month + delta, 1);
  return toMonthKey(d.getFullYear(), d.getMonth());
}

export function daysInMonth(key: MonthKey): number {
  const { year, month } = parseMonthKey(key);
  return new Date(year, month + 1, 0).getDate();
}

/** أول يوم في الأسبوع (السبت) اللي فيه التاريخ ده */
export function startOfWeek(key: DateKey, weekStartDay: number = WEEK_START_DAY): DateKey {
  const d = parseDateKey(key);
  const diff = (d.getDay() - weekStartDay + 7) % 7;
  return addDays(key, -diff);
}

export function formatMonth(key: MonthKey): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month]} ${year}`;
}

/** "الخميس، 9 أكتوبر" ولو السنة مختلفة عن السنة الحالية بتتضاف */
export function formatDateLong(key: DateKey, today: DateKey = todayKey()): string {
  const d = parseDateKey(key);
  const base = `${DAY_NAMES[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  return key.slice(0, 4) === today.slice(0, 4) ? base : `${base} ${d.getFullYear()}`;
}

/** "النهارده" / "امبارح" / التاريخ */
export function formatDayLabel(key: DateKey, today: DateKey = todayKey()): string {
  if (key === today) return 'النهارده';
  if (key === addDays(today, -1)) return 'امبارح';
  return formatDateLong(key, today);
}
