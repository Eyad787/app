/** حسابات الغياب (المرحلة 2 – الدوال جاهزة ومتختبرة) */

export type AttendanceStatus = 'present' | 'absent';
export type AbsenceLevel = 'safe' | 'warning' | 'danger';

export function attendanceSummary(records: { status: AttendanceStatus }[]) {
  const total = records.length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const present = total - absent;
  const absencePercent = total === 0 ? 0 : (absent / total) * 100;
  const attendancePercent = total === 0 ? 100 : 100 - absencePercent;
  return { total, present, absent, absencePercent, attendancePercent };
}

/**
 * مستوى الخطر:
 * - danger: وصل أو عدّى حد الحرمان
 * - warning: وصل 75% من الحد (مثلاً 19% لو الحد 25%)
 */
export function absenceLevel(absencePercent: number, limitPercent: number): AbsenceLevel {
  if (absencePercent >= limitPercent) return 'danger';
  if (absencePercent >= limitPercent * 0.75) return 'warning';
  return 'safe';
}

/** فاضل كام غياب مسموح من إجمالي حصص الترم المتوقعة */
export function absencesLeft(absent: number, expectedTotal: number, limitPercent: number): number {
  const allowed = Math.floor((expectedTotal * limitPercent) / 100);
  return Math.max(0, allowed - absent);
}
