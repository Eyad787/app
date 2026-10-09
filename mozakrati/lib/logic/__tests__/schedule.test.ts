/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ClassSession } from '@/lib/types';

import { classesForDay, currentAndNext, findConflicts, hourRange, layoutDay } from '../schedule';

const c = (id: string, day: ClassSession['day'], start: string, end: string): ClassSession => ({
  id,
  subjectId: 's',
  kind: 'lecture',
  day,
  start,
  end,
  location: '',
  instructor: '',
});

const classes = [c('b', 6, '11:00', '12:30'), c('a', 6, '09:00', '10:30'), c('x', 0, '09:00', '10:00'), c('d', 6, '14:00', '15:00')];

test('حصص اليوم مترتبة بالوقت', () => {
  assert.deepEqual(
    classesForDay(classes, 6).map((x) => x.id),
    ['a', 'b', 'd'],
  );
});

test('الحصة الحالية والجاية', () => {
  const day = classesForDay(classes, 6);
  assert.deepEqual(currentAndNext(day, 8 * 60), { currentId: null, nextId: 'a' });
  assert.deepEqual(currentAndNext(day, 9 * 60 + 15), { currentId: 'a', nextId: 'b' });
  assert.deepEqual(currentAndNext(day, 10 * 60 + 30), { currentId: null, nextId: 'b' });
  assert.deepEqual(currentAndNext(day, 16 * 60), { currentId: null, nextId: null });
});

test('التعارض في المواعيد', () => {
  assert.deepEqual(
    findConflicts(classes, { day: 6, start: '10:00', end: '11:30' }).map((x) => x.id),
    ['b', 'a'],
  );
  assert.equal(findConflicts(classes, { day: 6, start: '10:30', end: '11:00' }).length, 0);
  // تعديل نفس الحصة مايعتبرش تعارض مع نفسها
  assert.equal(findConflicts(classes, { id: 'a', day: 6, start: '09:00', end: '10:30' }).length, 0);
});

test('توزيع الحصص المتداخلة على أعمدة', () => {
  const day = [c('1', 1, '09:00', '11:00'), c('2', 1, '10:00', '12:00'), c('3', 1, '11:00', '12:00'), c('4', 1, '13:00', '14:00')];
  const res = Object.fromEntries(layoutDay(day).map((p) => [p.item.id, [p.column, p.columns]]));
  assert.deepEqual(res['1'], [0, 2]);
  assert.deepEqual(res['2'], [1, 2]);
  assert.deepEqual(res['3'], [0, 2]);
  assert.deepEqual(res['4'], [0, 1]);
});

test('مدى الساعات في الجدول', () => {
  assert.deepEqual(hourRange([]), { from: 8, to: 16 });
  assert.deepEqual(hourRange([c('e', 2, '07:30', '19:15')]), { from: 7, to: 20 });
});
