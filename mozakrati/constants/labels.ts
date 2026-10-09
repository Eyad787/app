import type { ClassKind, ExamKind, GradingSystem, PomodoroPhase, Priority, Weekday } from '@/lib/types';

export const APP_NAME = 'Mozakrati';

/** ترتيب أيام الدراسة: السبت لحد الخميس، والجمعة في الآخر */
export const WEEK_ORDER: Weekday[] = [6, 0, 1, 2, 3, 4, 5];

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MONTH_NAMES_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CLASS_KIND_LABELS: Record<ClassKind, string> = {
  lecture: 'Lecture',
  section: 'Section',
  lab: 'Lab',
};

export const EXAM_KIND_LABELS: Record<ExamKind, string> = {
  midterm: 'Midterm',
  final: 'Final',
  quiz: 'Quiz',
  practical: 'Practical',
  oral: 'Oral',
  assignment: 'Assignment',
  project: 'Project',
};

/** الأنواع اللي بتعتبر "تسليم" وليها علامة خلصت */
export const SUBMISSION_KINDS: ExamKind[] = ['assignment', 'project'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: 'Focus time',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

export const GRADING_LABELS: Record<GradingSystem, { title: string; hint: string }> = {
  gpa4: { title: 'GPA (out of 4)', hint: 'Credit hours and cumulative GPA (A, B+, ...)' },
  percent: { title: 'Percentages & grades', hint: 'Excellent, Very good, Good, Pass' },
};

export const YEAR_OPTIONS = ['Prep year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Internship / Postgrad'];

export const TERM_OPTIONS = ['Fall term', 'Spring term', 'Summer term'];
