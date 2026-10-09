import { initialPomodoro } from '@/lib/logic/pomodoro';
import type { AppData, Profile, Settings, Term } from '@/lib/types';

export const DATA_VERSION = 1;

export const DEFAULT_PROFILE: Profile = {
  name: '',
  faculty: '',
  year: '',
  term: '',
  gradingSystem: 'gpa4',
  onboardingDone: false,
};

export const DEFAULT_SETTINGS: Settings = {
  pomodoro: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 },
  dailyGoalMinutes: 120,
  absenceLimitPercent: 25,
  showFriday: false,
  sound: true,
  vibration: true,
  reminders: {
    beforeClass: true,
    beforeExam: true,
    beforeDeadline: true,
    dailyStudy: false,
    dailyStudyTime: '20:00',
  },
};

export const FIRST_TERM_ID = 'term-1';

export function defaultTerm(name = 'الترم الحالي'): Term {
  return { id: FIRST_TERM_ID, name, createdAt: new Date().toISOString(), archivedAt: null };
}

export function emptyData(): AppData {
  return {
    version: DATA_VERSION,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    terms: [defaultTerm()],
    currentTermId: FIRST_TERM_ID,
    subjects: [],
    classes: [],
    exams: [],
    tasks: [],
    studySessions: [],
    pomodoro: initialPomodoro(DEFAULT_SETTINGS.pomodoro),
  };
}
