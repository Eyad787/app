import type { ClassSession, Weekday } from '@/lib/types';

import { timeToMinutes } from './dates';

export function sortByStart<T extends { start: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

export function classesForDay(classes: ClassSession[], day: Weekday): ClassSession[] {
  return sortByStart(classes.filter((c) => c.day === day));
}

/**
 * بيحدد الحصة الحالية (لو فيه حصة شغالة دلوقتي) والحصة الجاية النهارده.
 * dayClasses لازم تكون حصص اليوم ده بس.
 */
export function currentAndNext(
  dayClasses: ClassSession[],
  nowMinutes: number,
): { currentId: string | null; nextId: string | null } {
  const sorted = sortByStart(dayClasses);
  const current = sorted.find((c) => timeToMinutes(c.start) <= nowMinutes && nowMinutes < timeToMinutes(c.end));
  const next = sorted.find((c) => timeToMinutes(c.start) > nowMinutes);
  return { currentId: current?.id ?? null, nextId: next?.id ?? null };
}

export function isValidRange(start: string, end: string): boolean {
  return timeToMinutes(end) > timeToMinutes(start);
}

export function overlaps(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

/** الحصص اللي بتتعارض مع حصة جديدة في نفس اليوم */
export function findConflicts(
  classes: ClassSession[],
  candidate: Pick<ClassSession, 'day' | 'start' | 'end'> & { id?: string },
): ClassSession[] {
  return classes.filter((c) => c.id !== candidate.id && c.day === candidate.day && overlaps(c, candidate));
}

export type PositionedClass = { item: ClassSession; column: number; columns: number };

/**
 * توزيع الحصص المتداخلة على أعمدة جنب بعض (لعرض الأسبوع في جدول).
 * كل مجموعة حصص متداخلة بتتقسم بالتساوي على عرض اليوم.
 */
export function layoutDay(dayClasses: ClassSession[]): PositionedClass[] {
  const sorted = sortByStart(dayClasses);
  const result: PositionedClass[] = [];
  let group: { item: ClassSession; column: number }[] = [];
  let groupEnd = -1;
  let columnEnds: number[] = [];

  const flush = () => {
    const columns = Math.max(1, columnEnds.length);
    for (const g of group) result.push({ ...g, columns });
    group = [];
    columnEnds = [];
  };

  for (const item of sorted) {
    const s = timeToMinutes(item.start);
    const e = timeToMinutes(item.end);
    if (group.length > 0 && s >= groupEnd) flush();
    let column = columnEnds.findIndex((end) => end <= s);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(e);
    } else {
      columnEnds[column] = e;
    }
    group.push({ item, column });
    groupEnd = Math.max(groupEnd, e);
  }
  flush();
  return result;
}

/** أول وآخر ساعة تتعرض في جدول الأسبوع */
export function hourRange(classes: ClassSession[], minStart = 8, minEnd = 16): { from: number; to: number } {
  let from = minStart;
  let to = minEnd;
  for (const c of classes) {
    from = Math.min(from, Math.floor(timeToMinutes(c.start) / 60));
    to = Math.max(to, Math.ceil(timeToMinutes(c.end) / 60));
  }
  return { from, to: Math.min(24, to) };
}
