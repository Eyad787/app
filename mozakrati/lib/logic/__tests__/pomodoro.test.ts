/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PomodoroSettings } from '@/lib/types';

import * as P from '../pomodoro';

const s: PomodoroSettings = { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 };
const MIN = 60_000;
const t0 = Date.UTC(2026, 9, 9, 10, 0, 0);

test('البداية والوقت الفاضل محسوب من وقت النهاية', () => {
  const st = P.start(P.initialPomodoro(s, 'math'), t0);
  assert.equal(st.status, 'running');
  assert.equal(P.remainingMs(st, t0), 25 * MIN);
  assert.equal(P.remainingMs(st, t0 + 10 * MIN), 15 * MIN);
  // حتى لو "التطبيق كان مقفول" ساعة، الفاضل مابيبقاش سالب
  assert.equal(P.remainingMs(st, t0 + 60 * MIN), 0);
});

test('الإيقاف المؤقت والاستكمال', () => {
  let st = P.start(P.initialPomodoro(s), t0);
  st = P.pause(st, t0 + 10 * MIN);
  assert.equal(st.status, 'paused');
  // الوقت مابيتحركش وهو موقوف
  assert.equal(P.remainingMs(st, t0 + 50 * MIN), 15 * MIN);
  st = P.resume(st, t0 + 50 * MIN);
  assert.equal(P.remainingMs(st, t0 + 55 * MIN), 10 * MIN);
});

test('انتهاء جلسة المذاكرة بيسجّلها ويجهّز الراحة', () => {
  const st = P.start(P.initialPomodoro(s, 'math'), t0);
  assert.equal(P.checkCompletion(st, t0 + 24 * MIN, s).completedPhase, null);
  // التطبيق اتفتح بعد ساعة: الجلسة بتتسجل بمدتها الحقيقية مش أكتر
  const res = P.checkCompletion(st, t0 + 60 * MIN, s);
  assert.equal(res.completedPhase, 'work');
  assert.deepEqual(res.finishedWork, { startedAt: new Date(t0).toISOString(), minutes: 25, subjectId: 'math' });
  assert.equal(res.state.phase, 'shortBreak');
  assert.equal(res.state.status, 'idle');
  assert.equal(res.state.completedWork, 1);
  assert.equal(res.state.durationMs, 5 * MIN);
});

test('راحة طويلة بعد 4 جلسات، والعدّاد يرجع صفر بعدها', () => {
  let st = P.initialPomodoro(s);
  let now = t0;
  for (let i = 1; i <= 4; i++) {
    st = P.start(st, now);
    now += 25 * MIN;
    st = P.checkCompletion(st, now, s).state;
    assert.equal(st.phase, i === 4 ? 'longBreak' : 'shortBreak');
    if (i < 4) {
      st = P.start(st, now);
      now += 5 * MIN;
      st = P.checkCompletion(st, now, s).state;
      assert.equal(st.phase, 'work');
    }
  }
  assert.equal(st.durationMs, 15 * MIN);
  st = P.start(st, now);
  st = P.checkCompletion(st, now + 15 * MIN, s).state;
  assert.equal(st.phase, 'work');
  assert.equal(st.completedWork, 0);
});

test('التخطّي بيسجّل المذاكرة اللي اتعملت بس', () => {
  const st = P.start(P.initialPomodoro(s, 'phy'), t0);
  const res = P.skip(st, t0 + 12 * MIN + 20_000, s);
  assert.equal(res.finishedWork?.minutes, 12);
  assert.equal(res.state.phase, 'shortBreak');
  assert.equal(res.state.completedWork, 0);
  // تخطّي الراحة يرجّع للمذاكرة من غير تسجيل
  const back = P.skip(P.start(res.state, t0 + 13 * MIN), t0 + 14 * MIN, s);
  assert.equal(back.state.phase, 'work');
  assert.equal(back.finishedWork, null);
});

test('الإنهاء بيسجّل الجزء اللي اتذاكر ويرجّع للبداية', () => {
  let st = P.start(P.initialPomodoro(s, 'cs'), t0);
  st = P.pause(st, t0 + 8 * MIN);
  const res = P.finish(st, t0 + 30 * MIN, s);
  assert.equal(res.finishedWork?.minutes, 8);
  assert.equal(res.state.status, 'idle');
  assert.equal(res.state.phase, 'work');
  assert.equal(res.state.subjectId, 'cs');
  // أقل من دقيقة مابيتسجلش
  assert.equal(P.finish(P.start(P.initialPomodoro(s), t0), t0 + 20_000, s).finishedWork, null);
});

test('تغيير الإعدادات بيأثر على المؤقت لما يكون واقف بس', () => {
  const idle = P.initialPomodoro(s);
  assert.equal(P.applySettings(idle, { ...s, workMinutes: 50 }).durationMs, 50 * MIN);
  const running = P.start(idle, t0);
  assert.equal(P.applySettings(running, { ...s, workMinutes: 50 }), running);
});

test('نسبة التقدّم', () => {
  const st = P.start(P.initialPomodoro(s), t0);
  assert.equal(P.progress(st, t0), 0);
  assert.equal(P.progress(st, t0 + 12.5 * MIN), 0.5);
  assert.equal(P.progress(st, t0 + 99 * MIN), 1);
});
