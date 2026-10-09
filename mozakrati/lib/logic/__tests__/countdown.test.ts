/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { countdownLabel, daysLeft, urgencyOf } from '../countdown';

const today = '2026-10-09';

test('daysLeft', () => {
  assert.equal(daysLeft('2026-10-09', today), 0);
  assert.equal(daysLeft('2026-10-19', today), 10);
  assert.equal(daysLeft('2026-10-01', today), -8);
});

test('countdownLabel', () => {
  assert.equal(countdownLabel('2026-10-09', today), 'النهارده');
  assert.equal(countdownLabel('2026-10-10', today), 'بكرة');
  assert.equal(countdownLabel('2026-10-11', today), 'فاضل يومين');
  assert.equal(countdownLabel('2026-10-14', today), 'فاضل 5 أيام');
  assert.equal(countdownLabel('2026-10-29', today), 'فاضل 20 يوم');
  assert.equal(countdownLabel('2026-10-08', today), 'كان امبارح');
  assert.equal(countdownLabel('2026-10-06', today), 'فات من 3 أيام');
});

test('أحمر لو فاضل أقل من 3 أيام', () => {
  assert.equal(urgencyOf('2026-10-09', today), 'urgent');
  assert.equal(urgencyOf('2026-10-11', today), 'urgent');
  assert.equal(urgencyOf('2026-10-12', today), 'soon');
  assert.equal(urgencyOf('2026-10-16', today), 'soon');
  assert.equal(urgencyOf('2026-10-17', today), 'normal');
  assert.equal(urgencyOf('2026-10-08', today), 'past');
});
