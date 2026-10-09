import type { DateKey, StudySession } from '@/lib/types';

import { addDays, startOfStudyWeek } from './dates';

export function minutesOn(sessions: StudySession[], date: DateKey): number {
  return sessions.reduce((sum, s) => (s.date === date ? sum + s.minutes : sum), 0);
}

export function minutesForSubject(sessions: StudySession[], subjectId: string): number {
  return sessions.reduce((sum, s) => (s.subjectId === subjectId ? sum + s.minutes : sum), 0);
}

export function minutesByDate(sessions: StudySession[]): Map<DateKey, number> {
  const map = new Map<DateKey, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  return map;
}

/** مذاكرة كل مادة (null = من غير مادة) مرتبة من الأكتر للأقل */
export function minutesBySubject(sessions: StudySession[]): { subjectId: string | null; minutes: number }[] {
  const map = new Map<string | null, number>();
  for (const s of sessions) map.set(s.subjectId, (map.get(s.subjectId) ?? 0) + s.minutes);
  return [...map.entries()].map(([subjectId, minutes]) => ({ subjectId, minutes })).sort((a, b) => b.minutes - a.minutes);
}

/** مذاكرة كل يوم في الأسبوع الدراسي (من السبت) */
export function weekMinutes(sessions: StudySession[], today: DateKey): { date: DateKey; minutes: number }[] {
  const start = startOfStudyWeek(today);
  const byDate = minutesByDate(sessions);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, minutes: byDate.get(date) ?? 0 };
  });
}

/**
 * عدد الأيام المتتالية اللي فيها مذاكرة.
 * لو النهارده لسه مافيهوش مذاكرة، الـ streak بيتحسب لحد امبارح (لسه ماتكسرش).
 */
export function streak(sessions: StudySession[], today: DateKey, minMinutes = 1): number {
  const byDate = minutesByDate(sessions);
  const studied = (d: DateKey) => (byDate.get(d) ?? 0) >= minMinutes;
  let day = studied(today) ? today : addDays(today, -1);
  let count = 0;
  while (studied(day)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

export function goalProgress(minutes: number, goalMinutes: number): number {
  if (goalMinutes <= 0) return 0;
  return Math.min(1, minutes / goalMinutes);
}
