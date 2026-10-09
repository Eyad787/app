/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addDays,
  countWord,
  diffDays,
  formatDayDate,
  formatDuration,
  formatTime,
  isValidDateKey,
  normalizeTimeInput,
  startOfStudyWeek,
  toDateKey,
  weekdayOf,
} from '../dates';

test('toDateKey و addDays', () => {
  assert.equal(toDateKey(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
});

test('diffDays تقويمي', () => {
  assert.equal(diffDays('2026-10-09', '2026-10-12'), 3);
  assert.equal(diffDays('2026-10-12', '2026-10-09'), -3);
  assert.equal(diffDays('2026-03-25', '2026-04-05'), 11);
});

test('isValidDateKey', () => {
  assert.ok(isValidDateKey('2026-10-09'));
  assert.ok(!isValidDateKey('2026-02-30'));
  assert.ok(!isValidDateKey('2026-1-1'));
  assert.ok(!isValidDateKey(42));
});

test('الأسبوع الدراسي بيبدأ السبت', () => {
  // 2026-10-09 يوم جمعة → السبت اللي قبله 2026-10-03
  assert.equal(weekdayOf('2026-10-09'), 5);
  assert.equal(startOfStudyWeek('2026-10-09'), '2026-10-03');
  assert.equal(startOfStudyWeek('2026-10-10'), '2026-10-10');
  assert.equal(startOfStudyWeek('2026-10-11'), '2026-10-10');
});

test('formatTime بنظام 12 ساعة', () => {
  assert.equal(formatTime('00:05'), '12:05 AM');
  assert.equal(formatTime('09:30'), '9:30 AM');
  assert.equal(formatTime('12:00'), '12:00 PM');
  assert.equal(formatTime('13:45'), '1:45 PM');
});

test('formatDayDate', () => {
  assert.equal(formatDayDate('2026-10-09'), 'Friday, Oct 9');
  assert.equal(formatDayDate('2026-10-09', true), 'Friday, Oct 9, 2026');
});

test('formatDuration', () => {
  assert.equal(formatDuration(0), '0 min');
  assert.equal(formatDuration(25), '25 min');
  assert.equal(formatDuration(60), '1 hr');
  assert.equal(formatDuration(80), '1 hr 20 min');
  assert.equal(formatDuration(5 * 60 + 2), '5 hr 2 min');
});

test('countWord', () => {
  assert.equal(countWord(1, 'day'), '1 day');
  assert.equal(countWord(3, 'day'), '3 days');
  assert.equal(countWord(2, 'class', 'classes'), '2 classes');
});

test('normalizeTimeInput', () => {
  assert.equal(normalizeTimeInput('9'), '09:00');
  assert.equal(normalizeTimeInput('930'), '09:30');
  assert.equal(normalizeTimeInput('21:5'), '21:05');
  assert.equal(normalizeTimeInput('٩:٣٠'), '09:30');
  assert.equal(normalizeTimeInput('25:00'), null);
  assert.equal(normalizeTimeInput('abc'), null);
});
