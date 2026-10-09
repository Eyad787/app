/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Exam, Task } from '@/lib/types';

import { nextExam, splitExams } from '../exams';
import { filterTasks, isOverdue, sortTasks } from '../tasks';

const today = '2026-10-09'; // جمعة؛ الأسبوع الدراسي من 3 لـ 9 أكتوبر

const t = (id: string, patch: Partial<Task> = {}): Task => ({
  id,
  title: id,
  subjectId: null,
  priority: 'medium',
  due: null,
  done: false,
  doneAt: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  ...patch,
});

const tasks = [
  t('noDue'),
  t('late', { due: '2026-10-07' }),
  t('today', { due: today, priority: 'low' }),
  t('todayHigh', { due: today, priority: 'high' }),
  t('nextWeek', { due: '2026-10-12', subjectId: 'math' }),
  t('done', { done: true, doneAt: '2026-10-08T10:00:00.000Z', subjectId: 'math' }),
];

test('ترتيب المهام', () => {
  assert.deepEqual(
    sortTasks(tasks).map((x) => x.id),
    ['late', 'todayHigh', 'today', 'nextWeek', 'noDue', 'done'],
  );
});

test('فلاتر المهام', () => {
  assert.deepEqual(filterTasks(tasks, 'today', today).map((x) => x.id), ['late', 'todayHigh', 'today']);
  assert.deepEqual(filterTasks(tasks, 'week', today).map((x) => x.id), ['late', 'todayHigh', 'today']);
  assert.deepEqual(filterTasks(tasks, 'week', '2026-10-10').map((x) => x.id), ['late', 'todayHigh', 'today', 'nextWeek']);
  assert.deepEqual(filterTasks(tasks, 'subject', today, 'math').map((x) => x.id), ['nextWeek']);
  assert.deepEqual(filterTasks(tasks, 'done', today).map((x) => x.id), ['done']);
  assert.equal(filterTasks(tasks, 'all', today).length, 5);
});

test('المهمة المتأخرة', () => {
  assert.ok(isOverdue(tasks[1], today));
  assert.ok(!isOverdue(tasks[2], today));
  assert.ok(!isOverdue(t('x', { due: '2026-10-01', done: true }), today));
});

const e = (id: string, date: string, patch: Partial<Exam> = {}): Exam => ({
  id,
  subjectId: null,
  kind: 'quiz',
  date,
  time: null,
  location: '',
  notes: '',
  done: false,
  createdAt: '',
  ...patch,
});

test('تقسيم الامتحانات لقادم وفات', () => {
  const exams = [
    e('far', '2026-11-01'),
    e('todayLate', today),
    e('todayEarly', today, { time: '09:00' }),
    e('old', '2026-10-01'),
    e('submitted', '2026-10-20', { kind: 'assignment', done: true }),
    e('quizDoneIgnored', '2026-10-20', { kind: 'quiz', done: true }),
  ];
  const { upcoming, past } = splitExams(exams, today);
  assert.deepEqual(upcoming.map((x) => x.id), ['todayEarly', 'todayLate', 'quizDoneIgnored', 'far']);
  assert.deepEqual(past.map((x) => x.id), ['submitted', 'old']);
  assert.equal(nextExam(exams, today)?.id, 'todayEarly');
  assert.equal(nextExam([], today), null);
});
