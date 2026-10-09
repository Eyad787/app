/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseBackup, serializeBackup } from '@/lib/db/backupFormat';
import { emptyData } from '@/lib/db/defaults';

test('النسخة الاحتياطية بترجع زي ما هي', () => {
  const data = emptyData();
  data.profile = { ...data.profile, name: 'منة', onboardingDone: true };
  data.subjects = [{ id: 's1', termId: data.currentTermId, name: 'فيزيا', color: '#E5484D', creditHours: 3, instructor: '', createdAt: '2026-10-01T00:00:00.000Z' }];
  data.classes = [{ id: 'c1', subjectId: 's1', kind: 'section', day: 6, start: '09:00', end: '10:30', location: 'B2', instructor: '' }];
  data.tasks = [{ id: 't1', title: 'شيت 2', subjectId: 's1', priority: 'high', due: '2026-10-10', done: false, doneAt: null, createdAt: '2026-10-01T00:00:00.000Z' }];
  const back = parseBackup(serializeBackup(data));
  assert.deepEqual(back, data);
});

test('البيانات البايظة بتتشال والناقصة بتاخد قيمة افتراضية', () => {
  const back = parseBackup(
    JSON.stringify({
      subjects: [{ id: 's1', name: 'كيمياء' }, { name: 'من غير id' }],
      classes: [
        { id: 'c1', subjectId: 's1', day: 1, start: '10:00', end: '09:00' },
        { id: 'c2', subjectId: 'missing', day: 1, start: '09:00', end: '10:00' },
        { id: 'c3', subjectId: 's1', day: 1, start: '09:00', end: '10:00' },
      ],
      tasks: [{ id: 't1', title: 'x', subjectId: 'missing', priority: 'urgent' }],
      settings: { pomodoro: { workMinutes: -5 } },
    }),
  );
  assert.equal(back.subjects.length, 1);
  assert.equal(back.subjects[0].creditHours, 3);
  assert.deepEqual(back.classes.map((c) => c.id), ['c3']);
  assert.equal(back.tasks[0].subjectId, null);
  assert.equal(back.tasks[0].priority, 'medium');
  assert.equal(back.settings.pomodoro.workMinutes, 1);
  assert.equal(back.profile.onboardingDone, false);
});

test('ملف مش بتاعنا بيترفض', () => {
  assert.throws(() => parseBackup('not json'), /JSON/);
  assert.throws(() => parseBackup('[1,2,3]'));
  assert.throws(() => parseBackup('{"foo": 1}'));
});
