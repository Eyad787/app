/**
 * حسابات المعدّل (المرحلة 2 – الدوال جاهزة ومتختبرة).
 * نظامين: GPA من 4 بالساعات المعتمدة، أو نسب مئوية وتقديرات.
 */

export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

/** النقاط الشائعة في الجامعات المصرية بنظام الساعات المعتمدة */
export const LETTER_POINTS: Record<LetterGrade, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0,
};

export type GradedCourse = { creditHours: number; points: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** المعدّل = مجموع (النقاط × الساعات) ÷ مجموع الساعات */
export function computeGpa(courses: GradedCourse[]): number {
  const credits = courses.reduce((s, c) => s + c.creditHours, 0);
  if (credits <= 0) return 0;
  return round2(courses.reduce((s, c) => s + c.points * c.creditHours, 0) / credits);
}

/** المعدّل التراكمي من معدّلات ترمات قديمة + الترم الحالي */
export function cumulativeGpa(terms: { gpa: number; creditHours: number }[]): number {
  return computeGpa(terms.map((t) => ({ creditHours: t.creditHours, points: t.gpa })));
}

/**
 * محتاج أجيب كام في الساعات الجاية علشان أوصل لمعدّل تراكمي معين.
 * بيرجّع null لو مستحيل (أكتر من 4).
 */
export function requiredGpa(current: { gpa: number; creditHours: number }, newCredits: number, target: number): number | null {
  if (newCredits <= 0) return null;
  const needed = (target * (current.creditHours + newCredits) - current.gpa * current.creditHours) / newCredits;
  if (needed > 4) return null;
  return round2(Math.max(0, needed));
}

export type PercentGrade = 'امتياز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف' | 'ضعيف جداً';

/** التقدير حسب النسبة (النظام المصري المعتاد) */
export function percentToGrade(percent: number): PercentGrade {
  if (percent >= 85) return 'امتياز';
  if (percent >= 75) return 'جيد جداً';
  if (percent >= 65) return 'جيد';
  if (percent >= 50) return 'مقبول';
  if (percent >= 30) return 'ضعيف';
  return 'ضعيف جداً';
}

/** النسبة المئوية المرجّحة بالساعات */
export function weightedPercent(courses: { creditHours: number; percent: number }[]): number {
  return computeGpa(courses.map((c) => ({ creditHours: c.creditHours, points: c.percent })));
}
