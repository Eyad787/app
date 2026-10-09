import type { IconName } from '@/components/Button';

export type TabRoute = 'index' | 'schedule' | 'subjects' | 'exams' | 'tasks' | 'pomodoro' | 'settings';

export type TabItem = { name: TabRoute; title: string; icon: IconName; activeIcon: IconName; mobile: boolean };

/**
 * كل الشاشات الرئيسية.
 * على الموبايل بيظهر في الشريط اللي تحت أول 5 بس (المؤقت والإعدادات بيتفتحوا من الرئيسية)،
 * وعلى اللاب توب كلهم بيظهروا في القائمة الجانبية.
 */
export const TABS: TabItem[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', activeIcon: 'home', mobile: true },
  { name: 'schedule', title: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar', mobile: true },
  { name: 'subjects', title: 'Subjects', icon: 'book-outline', activeIcon: 'book', mobile: true },
  { name: 'exams', title: 'Exams', icon: 'document-text-outline', activeIcon: 'document-text', mobile: true },
  { name: 'tasks', title: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox', mobile: true },
  { name: 'pomodoro', title: 'Study timer', icon: 'timer-outline', activeIcon: 'timer', mobile: false },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', activeIcon: 'settings', mobile: false },
];
