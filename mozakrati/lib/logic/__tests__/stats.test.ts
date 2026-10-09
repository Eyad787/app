/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { StudySession } from '@/lib/types';

import { goalProgress, minutesBySubject, minutesForSubject, minutesOn, streak, weekMinutes } from '../stats';

const ss = (date: string, minutes: number, subjectId: string | null = 'a'): StudySession => ({
  id: `${date}-${minutes}-${subjectId}`,
  subjectId,
  startedAt: `${date}T10:00:00.000Z`,
  date,
  minutes,
});

const sessions = [ss('2026-10-09', 25), ss('2026-10-09', 25, 'b'), ss('2026-10-08', 50), ss('2026-10-07', 10, null), ss('2026-10-04', 30)];

test('دقايق اليوم والمادة', () => {
  assert.equal(minutesOn(sessions, '2026-10-09'), 50);
  assert.equal(minutesOn(sessions, '2026-10-01'), 0);
  assert.equal(minutesForSubject(sessions, 'a'), 105);
});

test('التوزيع على المواد', () => {
  assert.deepEqual(minutesBySubject(sessions), [
    { subjectId: 'a', minutes: 105 },
    { subjectId: 'b', minutes: 25 },
    { subjectId: null, minutes: 10 },
  ]);
});

test('الأيام المتتالية', () => {
  assert.equal(streak(sessions, '2026-10-09'), 3);
  // النهارده لسه ماذاكرش: الـ streak بتاع امبارح لسه شغال
  assert.equal(streak(sessions, '2026-10-10'), 3);
  assert.equal(streak(sessions, '2026-10-11'), 0);
  assert.equal(streak([], '2026-10-09'), 0);
});

test('مذاكرة الأسبوع من السبت', () => {
  const week = weekMinutes(sessions, '2026-10-09');
  assert.equal(week.length, 7);
  assert.equal(week[0].date, '2026-10-03');
  assert.equal(week[1].minutes, 30);
  assert.equal(week[6].minutes, 50);
});

test('نسبة الهدف', () => {
  assert.equal(goalProgress(60, 120), 0.5);
  assert.equal(goalProgress(300, 120), 1);
  assert.equal(goalProgress(10, 0), 0);
});
