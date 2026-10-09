import type { DateKey, Priority, Task } from '@/lib/types';

import { addDays, startOfStudyWeek } from './dates';

export type TaskFilter = 'all' | 'today' | 'week' | 'subject' | 'done';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** الترتيب: المتأخر/الأقرب في التسليم الأول، وبعدين الأولوية، وبعدين الأحدث */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done && b.done) return (b.doneAt ?? '').localeCompare(a.doneAt ?? '');
    if (a.due !== b.due) {
      if (a.due == null) return 1;
      if (b.due == null) return -1;
      return a.due.localeCompare(b.due);
    }
    if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function isOverdue(task: Task, today: DateKey): boolean {
  return !task.done && task.due != null && task.due < today;
}

/** مهام النهارده = اللي تسليمها النهارده أو متأخرة */
export function isDueToday(task: Task, today: DateKey): boolean {
  return task.due != null && task.due <= today;
}

export function isDueThisWeek(task: Task, today: DateKey): boolean {
  if (task.due == null) return false;
  const weekEnd = addDays(startOfStudyWeek(today), 6);
  return task.due <= weekEnd;
}

export function filterTasks(tasks: Task[], filter: TaskFilter, today: DateKey, subjectId: string | null = null): Task[] {
  let list: Task[];
  switch (filter) {
    case 'today':
      list = tasks.filter((t) => !t.done && isDueToday(t, today));
      break;
    case 'week':
      list = tasks.filter((t) => !t.done && isDueThisWeek(t, today));
      break;
    case 'subject':
      list = tasks.filter((t) => !t.done && t.subjectId === subjectId);
      break;
    case 'done':
      list = tasks.filter((t) => t.done);
      break;
    default:
      list = tasks.filter((t) => !t.done);
  }
  return sortTasks(list);
}
