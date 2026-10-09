import type { ClassKind, ExamKind, GradingSystem, PomodoroPhase, Priority, Weekday } from '@/lib/types';

export const APP_NAME = 'مذاكرتي';

/** ترتيب أيام الدراسة: السبت لحد الخميس، والجمعة في الآخر */
export const WEEK_ORDER: Weekday[] = [6, 0, 1, 2, 3, 4, 5];

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  0: 'الأحد',
  1: 'الاتنين',
  2: 'التلات',
  3: 'الأربع',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

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

export const CLASS_KIND_LABELS: Record<ClassKind, string> = {
  lecture: 'محاضرة',
  section: 'سكشن',
  lab: 'معمل',
};

export const EXAM_KIND_LABELS: Record<ExamKind, string> = {
  midterm: 'ميدترم',
  final: 'فاينل',
  quiz: 'كويز',
  practical: 'عملي',
  oral: 'شفوي',
  assignment: 'Assignment',
  project: 'مشروع',
};

/** الأنواع اللي بتعتبر "تسليم" وليها علامة خلصت */
export const SUBMISSION_KINDS: ExamKind[] = ['assignment', 'project'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'عالية',
  medium: 'متوسطة',
  low: 'منخفضة',
};

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: 'وقت المذاكرة',
  shortBreak: 'راحة قصيرة',
  longBreak: 'راحة طويلة',
};

export const GRADING_LABELS: Record<GradingSystem, { title: string; hint: string }> = {
  gpa4: { title: 'GPA من 4', hint: 'ساعات معتمدة ومعدّل تراكمي (A, B+, ...)' },
  percent: { title: 'نسب وتقديرات', hint: 'امتياز، جيد جداً، جيد، مقبول' },
};

export const YEAR_OPTIONS = ['إعدادي', 'الفرقة الأولى', 'الفرقة التانية', 'الفرقة التالتة', 'الفرقة الرابعة', 'الفرقة الخامسة', 'امتياز / دراسات عليا'];

export const TERM_OPTIONS = ['الترم الأول', 'الترم التاني', 'الترم الصيفي'];

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: 'أحد',
  1: 'اتنين',
  2: 'تلات',
  3: 'أربع',
  4: 'خميس',
  5: 'جمعة',
  6: 'سبت',
};
