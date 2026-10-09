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
  assert.equal(countdownLabel('2026-10-09', today), 'Today');
  assert.equal(countdownLabel('2026-10-10', today), 'Tomorrow');
  assert.equal(countdownLabel('2026-10-11', today), 'In 2 days');
  assert.equal(countdownLabel('2026-10-14', today), 'In 5 days');
  assert.equal(countdownLabel('2026-10-29', today), 'In 20 days');
  assert.equal(countdownLabel('2026-10-08', today), 'Yesterday');
  assert.equal(countdownLabel('2026-10-06', today), '3 days ago');
});

test('أحمر لو فاضل أقل من 3 أيام', () => {
  assert.equal(urgencyOf('2026-10-09', today), 'urgent');
  assert.equal(urgencyOf('2026-10-11', today), 'urgent');
  assert.equal(urgencyOf('2026-10-12', today), 'soon');
  assert.equal(urgencyOf('2026-10-16', today), 'soon');
  assert.equal(urgencyOf('2026-10-17', today), 'normal');
  assert.equal(urgencyOf('2026-10-08', today), 'past');
});
