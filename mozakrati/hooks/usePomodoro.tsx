/**
 * متحكم مؤقت البومودورو للتطبيق كله.
 * الحالة متخزنة (endsAt) فلو التطبيق اتقفل ورجع، المؤقت بيكمل صح،
 * ولو المرحلة خلصت وهو مقفول بتتسجل الجلسة أول ما يفتح.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { PHASE_LABELS } from '@/constants/labels';
import { useData } from '@/lib/db/DataProvider';
import { playBell, preloadBell, vibrate } from '@/lib/feedback';
import * as P from '@/lib/logic/pomodoro';
import { cancelKind, cancelScheduled, configureNotifications, ensurePermission, scheduleAt } from '@/lib/notifications';
import type { PomodoroPhase, PomodoroState } from '@/lib/types';

type PomodoroContextValue = {
  state: PomodoroState;
  remainingMs: number;
  progress: number;
  /** آخر مرحلة خلصت (علشان نعرض رسالة) */
  lastCompleted: PomodoroPhase | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  finish: () => void;
  setSubject: (subjectId: string | null) => void;
  dismissCompleted: () => void;
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

const NOTIFY_TEXT: Record<PomodoroPhase, { title: string; body: string }> = {
  work: { title: 'برافو! خلصت جلسة مذاكرة 🎉', body: 'خد راحة صغيرة وارجع كمّل.' },
  shortBreak: { title: 'الراحة خلصت ⏰', body: 'يلا نرجع للمذاكرة.' },
  longBreak: { title: 'الراحة الطويلة خلصت ⏰', body: 'جاهز لدورة مذاكرة جديدة؟' },
};

/** لو اكتشفنا إن المرحلة خلصت بعد الوقت ده، يبقى التطبيق كان في الخلفية والإشعار كفاية */
const LATE_MS = 4000;

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { data, ready, setPomodoro, addStudySession } = useData();
  const state = data.pomodoro;
  const settings = data.settings;
  const [now, setNow] = useState(() => Date.now());
  const [lastCompleted, setLastCompleted] = useState<PomodoroPhase | null>(null);
  const notificationId = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    configureNotifications();
    preloadBell();
  }, []);

  const record = useCallback(
    (res: P.PomodoroResult) => {
      if (res.finishedWork) addStudySession(res.finishedWork);
      setPomodoro(res.state);
    },
    [addStudySession, setPomodoro],
  );

  const scheduleEnd = useCallback(async (s: PomodoroState) => {
    await cancelScheduled(notificationId.current);
    notificationId.current = null;
    if (s.status !== 'running' || s.endsAt == null) return;
    const text = NOTIFY_TEXT[s.phase];
    notificationId.current = await scheduleAt(s.endsAt, text.title, text.body, 'pomodoro');
  }, []);

  const check = useCallback(() => {
    const current = stateRef.current;
    const t = Date.now();
    setNow(t);
    const res = P.checkCompletion(current, t, settingsRef.current.pomodoro);
    if (!res.completedPhase) return;
    const late = current.endsAt != null && t - current.endsAt > LATE_MS;
    record(res);
    setLastCompleted(res.completedPhase);
    notificationId.current = null;
    if (!late) {
      if (settingsRef.current.sound) playBell();
      if (settingsRef.current.vibration) vibrate();
    }
  }, [record]);

  // عدّاد للعرض بس؛ الحساب الحقيقي من endsAt
  useEffect(() => {
    if (!ready || state.status !== 'running') return;
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, [ready, state.status, check]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  // بعد ما التطبيق يفتح من جديد: نشيل أي إشعار قديم للمؤقت ونجدول واحد جديد لو المؤقت شغال
  useEffect(() => {
    if (!ready) return;
    cancelKind('pomodoro').then(() => {
      if (stateRef.current.status === 'running') scheduleEnd(stateRef.current);
    });
  }, [ready, scheduleEnd]);

  const value = useMemo<PomodoroContextValue>(() => {
    const apply = (next: PomodoroState) => {
      setPomodoro(next);
      setNow(Date.now());
      scheduleEnd(next);
    };
    return {
      state,
      remainingMs: P.remainingMs(state, now),
      progress: P.progress(state, now),
      lastCompleted,
      start: () => {
        setLastCompleted(null);
        ensurePermission();
        apply(P.start(state, Date.now()));
      },
      pause: () => apply(P.pause(state, Date.now())),
      resume: () => apply(P.resume(state, Date.now())),
      skip: () => {
        setLastCompleted(null);
        const res = P.skip(state, Date.now(), settings.pomodoro);
        record(res);
        scheduleEnd(res.state);
      },
      finish: () => {
        setLastCompleted(null);
        const res = P.finish(state, Date.now(), settings.pomodoro);
        record(res);
        scheduleEnd(res.state);
      },
      setSubject: (subjectId) => setPomodoro({ ...state, subjectId }),
      dismissCompleted: () => setLastCompleted(null),
    };
  }, [state, now, lastCompleted, settings.pomodoro, setPomodoro, record, scheduleEnd]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoro لازم يتستخدم جوه PomodoroProvider');
  return ctx;
}

export const phaseLabel = (phase: PomodoroPhase) => PHASE_LABELS[phase];
