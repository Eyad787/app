/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addDays,
  diffDays,
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
  assert.equal(formatTime('00:05'), '12:05 ص');
  assert.equal(formatTime('09:30'), '9:30 ص');
  assert.equal(formatTime('12:00'), '12:00 م');
  assert.equal(formatTime('13:45'), '1:45 م');
});

test('formatDuration بالعامية', () => {
  assert.equal(formatDuration(0), '0 دقيقة');
  assert.equal(formatDuration(1), 'دقيقة');
  assert.equal(formatDuration(2), 'دقيقتين');
  assert.equal(formatDuration(5), '5 دقايق');
  assert.equal(formatDuration(25), '25 دقيقة');
  assert.equal(formatDuration(60), 'ساعة');
  assert.equal(formatDuration(120), 'ساعتين');
  assert.equal(formatDuration(80), 'ساعة و 20 دقيقة');
  assert.equal(formatDuration(5 * 60 + 2), '5 ساعات و دقيقتين');
});

test('normalizeTimeInput', () => {
  assert.equal(normalizeTimeInput('9'), '09:00');
  assert.equal(normalizeTimeInput('930'), '09:30');
  assert.equal(normalizeTimeInput('21:5'), '21:05');
  assert.equal(normalizeTimeInput('٩:٣٠'), '09:30');
  assert.equal(normalizeTimeInput('25:00'), null);
  assert.equal(normalizeTimeInput('abc'), null);
});
