import { SUBMISSION_KINDS } from '@/constants/labels';
import type { DateKey, Exam, ExamKind } from '@/lib/types';

export const isSubmission = (kind: ExamKind) => SUBMISSION_KINDS.includes(kind);

/** مفتاح للترتيب: التاريخ + الساعة (اللي من غير ساعة ييجي آخر اليوم) */
const sortKey = (e: Exam) => `${e.date}T${e.time ?? '23:59'}`;

export function sortExams(exams: Exam[], direction: 'asc' | 'desc' = 'asc'): Exam[] {
  const sorted = [...exams].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return direction === 'asc' ? sorted : sorted.reverse();
}

/** فات = تاريخه عدّى، أو تسليم اتعلّم عليه "خلصت" */
export function isPastExam(e: Exam, today: DateKey): boolean {
  return e.date < today || (isSubmission(e.kind) && e.done);
}

export function splitExams(exams: Exam[], today: DateKey): { upcoming: Exam[]; past: Exam[] } {
  const upcoming: Exam[] = [];
  const past: Exam[] = [];
  for (const e of exams) (isPastExam(e, today) ? past : upcoming).push(e);
  return { upcoming: sortExams(upcoming), past: sortExams(past, 'desc') };
}

export function nextExam(exams: Exam[], today: DateKey): Exam | null {
  return splitExams(exams, today).upcoming[0] ?? null;
}
