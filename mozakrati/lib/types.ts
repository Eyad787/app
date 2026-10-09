/**
 * أنواع البيانات الأساسية في التطبيق.
 * التواريخ بتتخزن كنص:
 *  - DateKey: 'YYYY-MM-DD' (تاريخ محلي من غير ساعة)
 *  - الوقت: 'HH:MM' بنظام 24 ساعة
 *  - الطوابع الزمنية: ISO string
 */

export type DateKey = string;
export type TimeHM = string;

/** أيام الأسبوع بنفس ترقيم JavaScript: 0 = الأحد ... 6 = السبت */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type GradingSystem = 'gpa4' | 'percent';

export type Profile = {
  name: string;
  faculty: string;
  year: string;
  term: string;
  gradingSystem: GradingSystem;
  onboardingDone: boolean;
};

export type PomodoroSettings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
};

export type ReminderSettings = {
  beforeClass: boolean;
  beforeExam: boolean;
  beforeDeadline: boolean;
  dailyStudy: boolean;
  dailyStudyTime: TimeHM;
};

export type Settings = {
  pomodoro: PomodoroSettings;
  dailyGoalMinutes: number;
  /** حد الحرمان من الغياب كنسبة مئوية (المرحلة 2) */
  absenceLimitPercent: number;
  showFriday: boolean;
  sound: boolean;
  vibration: boolean;
  /** التذكيرات (المرحلة 2) */
  reminders: ReminderSettings;
};

/** الترم: بنحتفظ بيه علشان الأرشفة والمعدّل التراكمي في المرحلة 2 */
export type Term = {
  id: string;
  name: string;
  createdAt: string;
  archivedAt: string | null;
};

export type Subject = {
  id: string;
  termId: string;
  name: string;
  color: string;
  creditHours: number;
  instructor: string;
  createdAt: string;
};

export type ClassKind = 'lecture' | 'section' | 'lab';

export type ClassSession = {
  id: string;
  subjectId: string;
  kind: ClassKind;
  day: Weekday;
  start: TimeHM;
  end: TimeHM;
  location: string;
  instructor: string;
};

export type ExamKind = 'midterm' | 'final' | 'quiz' | 'practical' | 'oral' | 'assignment' | 'project';

export type Exam = {
  id: string;
  subjectId: string | null;
  kind: ExamKind;
  date: DateKey;
  time: TimeHM | null;
  location: string;
  notes: string;
  /** للتسليمات: علامة "خلصت" */
  done: boolean;
  createdAt: string;
};

export type Priority = 'high' | 'medium' | 'low';

export type Task = {
  id: string;
  title: string;
  subjectId: string | null;
  priority: Priority;
  due: DateKey | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
};

/** جلسة مذاكرة متسجلة من البومودورو */
export type StudySession = {
  id: string;
  subjectId: string | null;
  /** ISO timestamp لبداية الجلسة */
  startedAt: string;
  /** اليوم المحلي اللي الجلسة اتحسبت فيه */
  date: DateKey;
  minutes: number;
};

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

/**
 * حالة المؤقت. كل الحسابات مبنية على الطوابع الزمنية (endsAt)،
 * فالمؤقت يفضل مظبوط حتى لو التطبيق اتقفل أو راح في الخلفية.
 */
export type PomodoroState = {
  status: 'idle' | 'running' | 'paused';
  phase: PomodoroPhase;
  subjectId: string | null;
  /** مدة المرحلة الحالية بالمللي ثانية */
  durationMs: number;
  /** وقت بداية المرحلة (ms) – بيتحرك لقدام بعد الإيقاف المؤقت */
  phaseStartedAt: number | null;
  /** وقت نهاية المرحلة (ms) لما تكون شغالة */
  endsAt: number | null;
  /** الوقت الفاضل (ms) لما تكون موقوفة مؤقتاً */
  remainingMs: number | null;
  /** عدد جلسات المذاكرة اللي خلصت في الدورة الحالية */
  completedWork: number;
  /** وقت بداية أول جزء من جلسة المذاكرة الحالية (ISO) */
  workStartedAt: string | null;
};

export type AppData = {
  version: number;
  profile: Profile;
  settings: Settings;
  terms: Term[];
  currentTermId: string;
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  tasks: Task[];
  studySessions: StudySession[];
  pomodoro: PomodoroState;
};

export type CollectionKey = keyof AppData;
