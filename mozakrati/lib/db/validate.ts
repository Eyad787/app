/**
 * التحقق من شكل البيانات قبل ما نستخدمها.
 * بيتستخدم وقت التحميل من التخزين ووقت استيراد نسخة احتياطية،
 * علشان بيانات بايظة أو ناقصة ماتوقعش التطبيق: العنصر البايظ بيتشال، والناقص بياخد قيمة افتراضية.
 */
import { isValidDateKey, isValidTime } from '@/lib/logic/dates';
import { initialPomodoro } from '@/lib/logic/pomodoro';
import type {
  AppData,
  ClassKind,
  ClassSession,
  Exam,
  ExamKind,
  PomodoroState,
  Priority,
  Profile,
  Settings,
  StudySession,
  Subject,
  Task,
  Term,
  Weekday,
} from '@/lib/types';

import { DATA_VERSION, DEFAULT_PROFILE, DEFAULT_SETTINGS, FIRST_TERM_ID, defaultTerm } from './defaults';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback;
const nullableStr = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
const isoOr = (v: unknown): string => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : new Date().toISOString());

function list<T>(v: unknown, parse: (item: Obj) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  const out: T[] = [];
  const seen = new Set<string>();
  for (const item of v) {
    if (!isObj(item)) continue;
    const parsed = parse(item);
    if (!parsed) continue;
    const id = (parsed as { id?: string }).id;
    if (id) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    out.push(parsed);
  }
  return out;
}

export function parseProfile(v: unknown): Profile {
  if (!isObj(v)) return DEFAULT_PROFILE;
  return {
    name: str(v.name).slice(0, 60),
    faculty: str(v.faculty).slice(0, 80),
    year: str(v.year).slice(0, 40),
    term: str(v.term).slice(0, 40),
    gradingSystem: oneOf(v.gradingSystem, ['gpa4', 'percent'] as const, 'gpa4'),
    onboardingDone: bool(v.onboardingDone, false),
  };
}

export function parseSettings(v: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!isObj(v)) return d;
  const p = isObj(v.pomodoro) ? v.pomodoro : {};
  const r = isObj(v.reminders) ? v.reminders : {};
  return {
    pomodoro: {
      workMinutes: Math.round(num(p.workMinutes, d.pomodoro.workMinutes, 1, 180)),
      shortBreakMinutes: Math.round(num(p.shortBreakMinutes, d.pomodoro.shortBreakMinutes, 1, 60)),
      longBreakMinutes: Math.round(num(p.longBreakMinutes, d.pomodoro.longBreakMinutes, 1, 90)),
      sessionsBeforeLongBreak: Math.round(num(p.sessionsBeforeLongBreak, d.pomodoro.sessionsBeforeLongBreak, 1, 12)),
    },
    dailyGoalMinutes: Math.round(num(v.dailyGoalMinutes, d.dailyGoalMinutes, 0, 24 * 60)),
    absenceLimitPercent: num(v.absenceLimitPercent, d.absenceLimitPercent, 1, 100),
    showFriday: bool(v.showFriday, d.showFriday),
    sound: bool(v.sound, d.sound),
    vibration: bool(v.vibration, d.vibration),
    reminders: {
      beforeClass: bool(r.beforeClass, d.reminders.beforeClass),
      beforeExam: bool(r.beforeExam, d.reminders.beforeExam),
      beforeDeadline: bool(r.beforeDeadline, d.reminders.beforeDeadline),
      dailyStudy: bool(r.dailyStudy, d.reminders.dailyStudy),
      dailyStudyTime: isValidTime(r.dailyStudyTime) ? r.dailyStudyTime : d.reminders.dailyStudyTime,
    },
  };
}

export const parseTerms = (v: unknown): Term[] =>
  list(v, (t) =>
    typeof t.id === 'string' && t.id
      ? { id: t.id, name: str(t.name, 'Term'), createdAt: isoOr(t.createdAt), archivedAt: nullableStr(t.archivedAt) }
      : null,
  );

export const parseSubjects = (v: unknown): Subject[] =>
  list(v, (s) =>
    typeof s.id === 'string' && s.id && typeof s.name === 'string' && s.name.trim()
      ? {
          id: s.id,
          termId: str(s.termId, FIRST_TERM_ID),
          name: s.name.trim().slice(0, 80),
          color: typeof s.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.color) ? s.color : '#5B5BD6',
          creditHours: num(s.creditHours, 3, 0, 20),
          instructor: str(s.instructor).slice(0, 80),
          createdAt: isoOr(s.createdAt),
        }
      : null,
  );

export const parseClasses = (v: unknown): ClassSession[] =>
  list(v, (c) => {
    if (typeof c.id !== 'string' || typeof c.subjectId !== 'string') return null;
    if (!isValidTime(c.start) || !isValidTime(c.end) || c.end <= c.start) return null;
    if (typeof c.day !== 'number' || !Number.isInteger(c.day) || c.day < 0 || c.day > 6) return null;
    return {
      id: c.id,
      subjectId: c.subjectId,
      kind: oneOf<ClassKind>(c.kind, ['lecture', 'section', 'lab'], 'lecture'),
      day: c.day as Weekday,
      start: c.start,
      end: c.end,
      location: str(c.location).slice(0, 80),
      instructor: str(c.instructor).slice(0, 80),
    };
  });

const EXAM_KINDS: ExamKind[] = ['midterm', 'final', 'quiz', 'practical', 'oral', 'assignment', 'project'];

export const parseExams = (v: unknown): Exam[] =>
  list(v, (e) => {
    if (typeof e.id !== 'string' || !isValidDateKey(e.date)) return null;
    return {
      id: e.id,
      subjectId: nullableStr(e.subjectId),
      kind: oneOf(e.kind, EXAM_KINDS, 'quiz'),
      date: e.date,
      time: isValidTime(e.time) ? e.time : null,
      location: str(e.location).slice(0, 80),
      notes: str(e.notes).slice(0, 2000),
      done: bool(e.done, false),
      createdAt: isoOr(e.createdAt),
    };
  });

export const parseTasks = (v: unknown): Task[] =>
  list(v, (t) => {
    if (typeof t.id !== 'string' || typeof t.title !== 'string' || !t.title.trim()) return null;
    const done = bool(t.done, false);
    return {
      id: t.id,
      title: t.title.trim().slice(0, 200),
      subjectId: nullableStr(t.subjectId),
      priority: oneOf<Priority>(t.priority, ['high', 'medium', 'low'], 'medium'),
      due: isValidDateKey(t.due) ? t.due : null,
      done,
      doneAt: done ? nullableStr(t.doneAt) : null,
      createdAt: isoOr(t.createdAt),
    };
  });

export const parseStudySessions = (v: unknown): StudySession[] =>
  list(v, (s) => {
    if (typeof s.id !== 'string' || !isValidDateKey(s.date)) return null;
    const minutes = num(s.minutes, 0, 0, 24 * 60);
    if (minutes <= 0) return null;
    return { id: s.id, subjectId: nullableStr(s.subjectId), startedAt: isoOr(s.startedAt), date: s.date, minutes };
  });

export function parsePomodoro(v: unknown, settings: Settings): PomodoroState {
  const fresh = initialPomodoro(settings.pomodoro);
  if (!isObj(v)) return fresh;
  const status = oneOf(v.status, ['idle', 'running', 'paused'] as const, 'idle');
  const phase = oneOf(v.phase, ['work', 'shortBreak', 'longBreak'] as const, 'work');
  const durationMs = num(v.durationMs, fresh.durationMs, 1000);
  const endsAt = typeof v.endsAt === 'number' ? v.endsAt : null;
  const remaining = typeof v.remainingMs === 'number' ? v.remainingMs : null;
  if (status === 'running' && endsAt == null) return fresh;
  if (status === 'paused' && remaining == null) return fresh;
  return {
    status,
    phase,
    subjectId: nullableStr(v.subjectId),
    durationMs,
    phaseStartedAt: typeof v.phaseStartedAt === 'number' ? v.phaseStartedAt : null,
    endsAt: status === 'running' ? endsAt : null,
    remainingMs: status === 'paused' ? remaining : null,
    completedWork: Math.round(num(v.completedWork, 0, 0, 1000)),
    workStartedAt: nullableStr(v.workStartedAt),
  };
}

/** بيحوّل أي JSON لبيانات تطبيق سليمة (للاستيراد) */
export function parseAppData(raw: unknown): AppData {
  if (!isObj(raw)) throw new Error('This file is not a Mozakrati backup.');
  if (!('subjects' in raw) && !('profile' in raw)) throw new Error('This file is not a Mozakrati backup.');
  const settings = parseSettings(raw.settings);
  let terms = parseTerms(raw.terms);
  if (terms.length === 0) terms = [defaultTerm()];
  const currentTermId =
    typeof raw.currentTermId === 'string' && terms.some((t) => t.id === raw.currentTermId) ? raw.currentTermId : terms[0].id;

  const subjects = parseSubjects(raw.subjects);
  const subjectIds = new Set(subjects.map((s) => s.id));
  const knownSubject = (id: string | null) => (id && subjectIds.has(id) ? id : null);

  return {
    version: DATA_VERSION,
    profile: parseProfile(raw.profile),
    settings,
    terms,
    currentTermId,
    subjects,
    classes: parseClasses(raw.classes).filter((c) => subjectIds.has(c.subjectId)),
    exams: parseExams(raw.exams).map((e) => ({ ...e, subjectId: knownSubject(e.subjectId) })),
    tasks: parseTasks(raw.tasks).map((t) => ({ ...t, subjectId: knownSubject(t.subjectId) })),
    studySessions: parseStudySessions(raw.studySessions),
    pomodoro: parsePomodoro(raw.pomodoro, settings),
  };
}
