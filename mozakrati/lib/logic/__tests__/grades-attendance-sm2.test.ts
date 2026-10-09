/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { absenceLevel, absencesLeft, attendanceSummary } from '../attendance';
import { computeGpa, cumulativeGpa, LETTER_POINTS, percentToGrade, requiredGpa, weightedPercent } from '../grades';
import { isDue, newCard, review } from '../sm2';

test('المعدّل بالساعات المعتمدة', () => {
  assert.equal(computeGpa([]), 0);
  assert.equal(
    computeGpa([
      { creditHours: 3, points: LETTER_POINTS.A },
      { creditHours: 2, points: LETTER_POINTS['B+'] },
      { creditHours: 1, points: LETTER_POINTS.C },
    ]),
    3.43,
  );
  assert.equal(cumulativeGpa([{ gpa: 3.2, creditHours: 18 }, { gpa: 3.8, creditHours: 18 }]), 3.5);
});

test('محتاج أجيب كام علشان أوصل لمعدّل', () => {
  assert.equal(requiredGpa({ gpa: 3.0, creditHours: 60 }, 20, 3.2), 3.8);
  assert.equal(requiredGpa({ gpa: 2.0, creditHours: 100 }, 10, 3.5), null);
  assert.equal(requiredGpa({ gpa: 3.9, creditHours: 30 }, 15, 2.0), 0);
});

test('التقديرات بالنسب', () => {
  assert.equal(percentToGrade(92), 'Excellent');
  assert.equal(percentToGrade(85), 'Excellent');
  assert.equal(percentToGrade(80), 'Very good');
  assert.equal(percentToGrade(70), 'Good');
  assert.equal(percentToGrade(50), 'Pass');
  assert.equal(percentToGrade(40), 'Weak');
  assert.equal(weightedPercent([{ creditHours: 3, percent: 90 }, { creditHours: 1, percent: 70 }]), 85);
});

test('الغياب وحد الحرمان', () => {
  const recs = [...Array(8).fill({ status: 'present' }), ...Array(2).fill({ status: 'absent' })];
  const sum = attendanceSummary(recs);
  assert.equal(sum.absencePercent, 20);
  assert.equal(sum.attendancePercent, 80);
  assert.equal(absenceLevel(10, 25), 'safe');
  assert.equal(absenceLevel(20, 25), 'warning');
  assert.equal(absenceLevel(25, 25), 'danger');
  assert.equal(absencesLeft(2, 24, 25), 4);
  assert.equal(attendanceSummary([]).attendancePercent, 100);
});

test('SM-2', () => {
  const today = '2026-10-09';
  let card = newCard(today);
  assert.ok(isDue(card, today));
  card = review(card, 'good', today);
  assert.equal(card.interval, 1);
  assert.equal(card.due, '2026-10-10');
  card = review(card, 'good', '2026-10-10');
  assert.equal(card.interval, 6);
  card = review(card, 'easy', '2026-10-16');
  assert.equal(card.repetitions, 3);
  assert.equal(card.interval, Math.round(6 * card.ease));
  const failed = review(card, 'hard', '2026-11-01');
  assert.equal(failed.repetitions, 0);
  assert.equal(failed.interval, 1);
  assert.ok(failed.ease < card.ease);
  assert.ok(failed.ease >= 1.3);
});
