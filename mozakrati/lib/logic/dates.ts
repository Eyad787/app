import { MONTH_NAMES, WEEKDAY_NAMES } from '@/constants/labels';
import type { DateKey, TimeHM, Weekday } from '@/lib/types';

const pad = (n: number) => String(n).padStart(2, '0');

/** تاريخ محلي بصيغة YYYY-MM-DD */
export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isValidDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDateKey(value);
  return toDateKey(d) === value;
}

/** بيحوّل YYYY-MM-DD لتاريخ محلي الساعة 12 بالليل */
export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** الفرق بالأيام (تقويمياً) بين تاريخين: b - a */
export function diffDays(a: DateKey, b: DateKey): number {
  const da = parseDateKey(a);
  const db = parseDateKey(b);
  // UTC علشان التوقيت الصيفي مايلخبطش الحساب
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((ub - ua) / 86_400_000);
}

export function weekdayOf(key: DateKey): Weekday {
  return parseDateKey(key).getDay() as Weekday;
}

/** أول يوم في الأسبوع الدراسي (السبت) للتاريخ ده */
export function startOfStudyWeek(key: DateKey): DateKey {
  const wd = weekdayOf(key);
  const back = (wd + 1) % 7; // السبت = 0 خطوة، الأحد = 1، ... الجمعة = 6
  return addDays(key, -back);
}

export function isValidTime(value: unknown): value is TimeHM {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, m] = value.split(':').map(Number);
  return h >= 0 && h < 24 && m >= 0 && m < 60;
}

export function timeToMinutes(t: TimeHM): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): TimeHM {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(total)));
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`;
}

/** بيقبل كتابة زي 9 أو 9:5 أو 930 أو 21:30 ويرجّع HH:MM أو null */
export function normalizeTimeInput(raw: string): TimeHM | null {
  const s = raw.trim().replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[.٫،]/g, ':');
  let h: number;
  let m: number;
  if (/^\d{1,2}$/.test(s)) {
    h = Number(s);
    m = 0;
  } else if (/^\d{3,4}$/.test(s)) {
    h = Number(s.slice(0, s.length - 2));
    m = Number(s.slice(-2));
  } else if (/^\d{1,2}:\d{1,2}$/.test(s)) {
    [h, m] = s.split(':').map(Number);
  } else {
    return null;
  }
  if (h > 23 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** 13:30 → "1:30 PM" */
export function formatTime(t: TimeHM): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

/** "Friday, Oct 9" */
export function formatDayDate(key: DateKey, withYear = false): string {
  const d = parseDateKey(key);
  const base = `${WEEKDAY_NAMES[d.getDay() as Weekday]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  return withYear ? `${base}, ${d.getFullYear()}` : base;
}

/** "Oct 9" */
export function formatShortDate(key: DateKey): string {
  const d = parseDateKey(key);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/** "1 day" / "3 days" */
export function countWord(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** "1 hr 20 min" */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** "2:15 h" short form for cards and charts */
export function formatHoursShort(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}:${pad(m)}h`;
}

/** 25:00 */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h >= 4 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}
