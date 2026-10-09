import type { PomodoroPhase, PomodoroSettings, PomodoroState } from '@/lib/types';

/**
 * منطق مؤقت البومودورو كدوال نقية.
 * المؤقت مش عدّاد بينقص كل ثانية؛ هو بيحفظ وقت النهاية (endsAt)
 * وكل مرة بنحسب الفاضل = endsAt - الوقت الحالي.
 * كده لو التطبيق اتقفل أو راح في الخلفية، أول ما يرجع الحساب يبقى صح.
 */

const MINUTE = 60_000;

export type FinishedWork = { startedAt: string; minutes: number; subjectId: string | null };

export type PomodoroResult = {
  state: PomodoroState;
  /** جلسة مذاكرة خلصت ولازم تتسجل */
  finishedWork: FinishedWork | null;
  /** المرحلة اللي خلصت لوحدها (علشان الصوت/الإشعار) */
  completedPhase: PomodoroPhase | null;
};

export function phaseDurationMs(phase: PomodoroPhase, s: PomodoroSettings): number {
  const minutes = phase === 'work' ? s.workMinutes : phase === 'shortBreak' ? s.shortBreakMinutes : s.longBreakMinutes;
  return Math.max(1, minutes) * MINUTE;
}

export function initialPomodoro(s: PomodoroSettings, subjectId: string | null = null): PomodoroState {
  return {
    status: 'idle',
    phase: 'work',
    subjectId,
    durationMs: phaseDurationMs('work', s),
    phaseStartedAt: null,
    endsAt: null,
    remainingMs: null,
    completedWork: 0,
    workStartedAt: null,
  };
}

export function remainingMs(state: PomodoroState, now: number): number {
  if (state.status === 'running' && state.endsAt != null) return Math.max(0, state.endsAt - now);
  if (state.status === 'paused' && state.remainingMs != null) return state.remainingMs;
  return state.durationMs;
}

/** نسبة اللي خلص من المرحلة (0 → 1) */
export function progress(state: PomodoroState, now: number): number {
  if (state.durationMs <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remainingMs(state, now) / state.durationMs));
}

const noEvent = (state: PomodoroState): PomodoroResult => ({ state, finishedWork: null, completedPhase: null });

export function start(state: PomodoroState, now: number): PomodoroState {
  if (state.status === 'running') return state;
  if (state.status === 'paused') return resume(state, now);
  return {
    ...state,
    status: 'running',
    phaseStartedAt: now,
    endsAt: now + state.durationMs,
    remainingMs: null,
    workStartedAt: state.phase === 'work' ? new Date(now).toISOString() : state.workStartedAt,
  };
}

export function pause(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== 'running' || state.endsAt == null) return state;
  return { ...state, status: 'paused', remainingMs: Math.max(0, state.endsAt - now), endsAt: null };
}

export function resume(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== 'paused' || state.remainingMs == null) return state;
  return { ...state, status: 'running', endsAt: now + state.remainingMs, remainingMs: null };
}

/** الوقت اللي اتذاكر فعلاً في المرحلة الحالية */
function elapsedMs(state: PomodoroState, now: number): number {
  return Math.max(0, state.durationMs - remainingMs(state, now));
}

function workRecord(state: PomodoroState, ms: number, now: number): FinishedWork | null {
  const minutes = Math.round(ms / MINUTE);
  if (minutes < 1) return null;
  return {
    startedAt: state.workStartedAt ?? new Date(now - ms).toISOString(),
    minutes,
    subjectId: state.subjectId,
  };
}

function toPhase(state: PomodoroState, phase: PomodoroPhase, s: PomodoroSettings, completedWork: number): PomodoroState {
  return {
    ...state,
    status: 'idle',
    phase,
    durationMs: phaseDurationMs(phase, s),
    phaseStartedAt: null,
    endsAt: null,
    remainingMs: null,
    completedWork,
    workStartedAt: null,
  };
}

/** المرحلة الجاية بعد ما مرحلة تخلص */
export function nextPhase(phase: PomodoroPhase, completedWork: number, s: PomodoroSettings): PomodoroPhase {
  if (phase !== 'work') return 'work';
  return completedWork > 0 && completedWork % Math.max(1, s.sessionsBeforeLongBreak) === 0 ? 'longBreak' : 'shortBreak';
}

/**
 * بيتنده دورياً (وأول ما التطبيق يرجع من الخلفية).
 * لو وقت المرحلة خلص بيسجّل الجلسة وبيجهّز المرحلة اللي بعدها.
 */
export function checkCompletion(state: PomodoroState, now: number, s: PomodoroSettings): PomodoroResult {
  if (state.status !== 'running' || state.endsAt == null || now < state.endsAt) return noEvent(state);
  const endedAt = state.endsAt;
  if (state.phase === 'work') {
    const done = state.completedWork + 1;
    return {
      state: toPhase(state, nextPhase('work', done, s), s, done),
      finishedWork: workRecord(state, state.durationMs, endedAt),
      completedPhase: 'work',
    };
  }
  const counter = state.phase === 'longBreak' ? 0 : state.completedWork;
  return { state: toPhase(state, 'work', s, counter), finishedWork: null, completedPhase: state.phase };
}

/** تخطّي المرحلة الحالية. المذاكرة اللي اتعملت فعلاً بتتسجل */
export function skip(state: PomodoroState, now: number, s: PomodoroSettings): PomodoroResult {
  if (state.phase === 'work') {
    const record = state.status === 'idle' ? null : workRecord(state, elapsedMs(state, now), now);
    // الجلسة المتخطّاة مابتتحسبش من الأربع جلسات، فالراحة بتبقى قصيرة
    return { state: toPhase(state, 'shortBreak', s, state.completedWork), finishedWork: record, completedPhase: null };
  }
  const counter = state.phase === 'longBreak' ? 0 : state.completedWork;
  return { state: toPhase(state, 'work', s, counter), finishedWork: null, completedPhase: null };
}

/** إنهاء الدورة كلها والرجوع للبداية */
export function finish(state: PomodoroState, now: number, s: PomodoroSettings): PomodoroResult {
  const record = state.phase === 'work' && state.status !== 'idle' ? workRecord(state, elapsedMs(state, now), now) : null;
  return { state: initialPomodoro(s, state.subjectId), finishedWork: record, completedPhase: null };
}

/** لو الإعدادات اتغيرت والمؤقت مش شغال، المدة تتحدث */
export function applySettings(state: PomodoroState, s: PomodoroSettings): PomodoroState {
  if (state.status !== 'idle') return state;
  const durationMs = phaseDurationMs(state.phase, s);
  return durationMs === state.durationMs ? state : { ...state, durationMs };
}
