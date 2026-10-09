/**
 * مخزن البيانات للتطبيق كله.
 * أي تعديل بيتحدث في الواجهة فوراً وبيتحفظ على الجهاز في نفس اللحظة.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { toDateKey } from '@/lib/logic/dates';
import { newId } from '@/lib/logic/id';
import { applySettings } from '@/lib/logic/pomodoro';
import type {
  AppData,
  ClassSession,
  CollectionKey,
  Exam,
  PomodoroState,
  Profile,
  Settings,
  StudySession,
  Subject,
  Task,
} from '@/lib/types';

import { emptyData } from './defaults';
import { clearAll, loadAll, saveAll, saveKey } from './storage';

export type SubjectInput = Pick<Subject, 'name' | 'color' | 'creditHours'> & Partial<Pick<Subject, 'instructor'>>;
export type ClassInput = Omit<ClassSession, 'id'>;
export type ExamInput = Omit<Exam, 'id' | 'createdAt' | 'done'> & { done?: boolean };
export type TaskInput = Pick<Task, 'title' | 'subjectId' | 'priority' | 'due'>;

type Actions = {
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;

  addSubject: (input: SubjectInput) => string;
  updateSubject: (id: string, patch: Partial<SubjectInput>) => void;
  deleteSubject: (id: string) => void;

  addClass: (input: ClassInput) => string;
  updateClass: (id: string, patch: Partial<ClassInput>) => void;
  deleteClass: (id: string) => void;

  addExam: (input: ExamInput) => string;
  updateExam: (id: string, patch: Partial<ExamInput>) => void;
  deleteExam: (id: string) => void;

  addTask: (input: TaskInput) => string;
  updateTask: (id: string, patch: Partial<TaskInput>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addStudySession: (input: Omit<StudySession, 'id' | 'date'>) => void;
  setPomodoro: (state: PomodoroState) => void;

  replaceAll: (data: AppData) => Promise<void>;
  resetAll: () => Promise<void>;
};

type DataContextValue = { data: AppData; ready: boolean } & Actions;

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const ref = useRef(data);

  useEffect(() => {
    let alive = true;
    loadAll()
      .then((loaded) => {
        if (!alive) return;
        ref.current = loaded;
        setData(loaded);
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  /** بيعدّل جزء واحد من البيانات ويحفظه فوراً */
  const update = useCallback(<K extends CollectionKey>(key: K, fn: (prev: AppData[K]) => AppData[K]) => {
    const prev = ref.current;
    const value = fn(prev[key]);
    if (value === prev[key]) return;
    const next = { ...prev, [key]: value };
    ref.current = next;
    setData(next);
    saveKey(key, value).catch(() => undefined);
  }, []);

  const actions = useMemo<Actions>(() => {
    const now = () => new Date().toISOString();
    const patchById =
      <T extends { id: string }>(id: string, patch: Partial<T>) =>
      (list: T[]) =>
        list.map((item) => (item.id === id ? { ...item, ...patch } : item));

    return {
      updateProfile: (patch) => update('profile', (p) => ({ ...p, ...patch })),
      updateSettings: (patch) => {
        update('settings', (s) => ({ ...s, ...patch }));
        const settings = ref.current.settings;
        update('pomodoro', (p) => applySettings(p, settings.pomodoro));
      },

      addSubject: (input) => {
        const id = newId();
        const subject: Subject = {
          id,
          termId: ref.current.currentTermId,
          name: input.name.trim(),
          color: input.color,
          creditHours: input.creditHours,
          instructor: input.instructor?.trim() ?? '',
          createdAt: now(),
        };
        update('subjects', (list) => [...list, subject]);
        return id;
      },
      updateSubject: (id, patch) => update('subjects', patchById<Subject>(id, patch)),
      deleteSubject: (id) => {
        update('subjects', (list) => list.filter((s) => s.id !== id));
        update('classes', (list) => list.filter((c) => c.subjectId !== id));
        update('exams', (list) => list.filter((e) => e.subjectId !== id));
        // المهام وجلسات المذاكرة بتفضل، بس بتبقى "عامة"
        update('tasks', (list) =>
          list.some((t) => t.subjectId === id) ? list.map((t) => (t.subjectId === id ? { ...t, subjectId: null } : t)) : list,
        );
        update('studySessions', (list) =>
          list.some((s) => s.subjectId === id) ? list.map((s) => (s.subjectId === id ? { ...s, subjectId: null } : s)) : list,
        );
        update('pomodoro', (p) => (p.subjectId === id ? { ...p, subjectId: null } : p));
      },

      addClass: (input) => {
        const id = newId();
        update('classes', (list) => [...list, { ...input, id }]);
        return id;
      },
      updateClass: (id, patch) => update('classes', patchById<ClassSession>(id, patch)),
      deleteClass: (id) => update('classes', (list) => list.filter((c) => c.id !== id)),

      addExam: (input) => {
        const id = newId();
        update('exams', (list) => [...list, { done: false, ...input, id, createdAt: now() }]);
        return id;
      },
      updateExam: (id, patch) => update('exams', patchById<Exam>(id, patch)),
      deleteExam: (id) => update('exams', (list) => list.filter((e) => e.id !== id)),

      addTask: (input) => {
        const id = newId();
        const task: Task = { ...input, title: input.title.trim(), id, done: false, doneAt: null, createdAt: now() };
        update('tasks', (list) => [task, ...list]);
        return id;
      },
      updateTask: (id, patch) => update('tasks', patchById<Task>(id, patch)),
      toggleTask: (id) =>
        update('tasks', (list) =>
          list.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? null : now() } : t)),
        ),
      deleteTask: (id) => update('tasks', (list) => list.filter((t) => t.id !== id)),

      addStudySession: (input) => {
        const session: StudySession = { ...input, id: newId(), date: toDateKey(new Date(input.startedAt)) };
        update('studySessions', (list) => [...list, session]);
      },
      setPomodoro: (state) => update('pomodoro', () => state),

      replaceAll: async (next) => {
        ref.current = next;
        setData(next);
        await saveAll(next);
      },
      resetAll: async () => {
        await clearAll();
        const fresh = emptyData();
        ref.current = fresh;
        setData(fresh);
      },
    };
  }, [update]);

  const value = useMemo(() => ({ data, ready, ...actions }), [data, ready, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}

/** المواد في الترم الحالي */
export function useSubjects(): Subject[] {
  const { data } = useData();
  return useMemo(() => data.subjects.filter((s) => s.termId === data.currentTermId), [data.subjects, data.currentTermId]);
}

export function useSubjectMap(): Map<string, Subject> {
  const { data } = useData();
  return useMemo(() => new Map(data.subjects.map((s) => [s.id, s])), [data.subjects]);
}
