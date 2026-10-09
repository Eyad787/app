/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  availableMonths,
  averageDaily,
  budgetStatus,
  compareWithPreviousMonth,
  filterExpenses,
  groupByDay,
  sortByNewest,
  sumByCategory,
  sumByDay,
  topCategory,
  totalForDay,
  totalForMonth,
  totalForWeek,
  totalOf,
} from '../calculations';
import type { CategoryId, Expense } from '../types';

let seq = 0;
function exp(amount: number, category: CategoryId, date: string, note = ''): Expense {
  seq += 1;
  return { id: `e${seq}`, amount, category, date, note, createdAt: `2026-01-01T00:00:${String(seq).padStart(2, '0')}Z` };
}

const data: Expense[] = [
  exp(100, 'food', '2026-10-09', 'غدا'),
  exp(50.5, 'transport', '2026-10-09', 'أوبر'),
  exp(200, 'bills', '2026-10-05', 'كهربا'),
  exp(30, 'food', '2026-10-03'),
  exp(400, 'shopping', '2026-09-20', 'هدوم'),
  exp(100, 'food', '2026-09-02'),
];

describe('الإجماليات', () => {
  it('totalOf بيجمع المبالغ ويقرّب لقرشين', () => {
    assert.equal(totalOf(data), 880.5);
    assert.equal(totalOf([]), 0);
    assert.equal(totalOf([exp(0.1, 'food', '2026-10-01'), exp(0.2, 'food', '2026-10-01')]), 0.3);
  });

  it('إجمالي اليوم والشهر', () => {
    assert.equal(totalForDay(data, '2026-10-09'), 150.5);
    assert.equal(totalForMonth(data, '2026-10'), 380.5);
    assert.equal(totalForMonth(data, '2026-09'), 500);
    assert.equal(totalForMonth(data, '2026-08'), 0);
  });

  it('الأسبوع بيبدأ من السبت', () => {
    // 9 أكتوبر 2026 يوم جمعة، فالأسبوع بدأ السبت 3 أكتوبر
    assert.equal(totalForWeek(data, '2026-10-09'), 380.5);
    // 2 أكتوبر (جمعة) أسبوعه من 26 سبتمبر لـ 2 أكتوبر
    assert.equal(totalForWeek(data, '2026-10-02'), 0);
  });
});

describe('التجميع حسب النوع', () => {
  it('مرتب من الأكبر ونسبه مجموعها 100', () => {
    const result = sumByCategory(data);
    assert.deepEqual(
      result.map((r) => r.category),
      ['shopping', 'food', 'bills', 'transport'],
    );
    const food = result.find((r) => r.category === 'food')!;
    assert.equal(food.total, 230);
    assert.equal(food.count, 3);
    const sum = result.reduce((a, r) => a + r.percent, 0);
    assert.ok(Math.abs(sum - 100) < 1e-9);
  });

  it('أكتر نوع', () => {
    assert.equal(topCategory(data)?.category, 'shopping');
    assert.equal(topCategory([]), null);
  });
});

describe('التجميع حسب اليوم', () => {
  it('sumByDay بيرجع كل أيام الشهر', () => {
    const days = sumByDay(data, '2026-10');
    assert.equal(days.length, 31);
    assert.equal(days[8].total, 150.5);
    assert.equal(days[8].date, '2026-10-09');
    assert.equal(days[0].total, 0);
    assert.equal(sumByDay([], '2026-02').length, 28);
    assert.equal(sumByDay([], '2028-02').length, 29);
  });

  it('groupByDay من الأحدث للأقدم', () => {
    const groups = groupByDay(data);
    assert.deepEqual(
      groups.map((g) => g.date),
      ['2026-10-09', '2026-10-05', '2026-10-03', '2026-09-20', '2026-09-02'],
    );
    assert.equal(groups[0].total, 150.5);
    assert.equal(groups[0].data.length, 2);
  });

  it('sortByNewest بيرتب بالتاريخ وبعدين بوقت الإضافة', () => {
    const sorted = sortByNewest(data);
    assert.equal(sorted[0].note, 'أوبر');
    assert.equal(sorted[sorted.length - 1].date, '2026-09-02');
  });
});

describe('المقارنة والمتوسط', () => {
  it('مقارنة بالشهر اللي فات', () => {
    const c = compareWithPreviousMonth(data, '2026-10');
    assert.equal(c.current, 380.5);
    assert.equal(c.previous, 500);
    assert.equal(c.direction, 'down');
    assert.ok(Math.abs(c.changePercent! - -23.9) < 1e-9);
  });

  it('مفيش نسبة لو الشهر اللي فات فاضي', () => {
    const c = compareWithPreviousMonth(data, '2026-09');
    assert.equal(c.changePercent, null);
    assert.equal(c.direction, 'up');
  });

  it('متوسط الصرف اليومي', () => {
    // الشهر الحالي: 380.5 على 9 أيام
    assert.equal(averageDaily(data, '2026-10', '2026-10-09'), 42.28);
    // شهر خلص: 500 على 30 يوم
    assert.equal(averageDaily(data, '2026-09', '2026-10-09'), 16.67);
    assert.equal(averageDaily(data, '2026-11', '2026-10-09'), 0);
  });
});

describe('الميزانية', () => {
  it('حالة الميزانية', () => {
    assert.equal(budgetStatus(100, null), null);
    assert.equal(budgetStatus(100, 0), null);
    const ok = budgetStatus(300, 1000)!;
    assert.equal(ok.remaining, 700);
    assert.equal(ok.isOver, false);
    assert.equal(ok.ratio, 0.3);
    const over = budgetStatus(1200, 1000)!;
    assert.equal(over.isOver, true);
    assert.equal(over.remaining, -200);
  });
});

describe('الفلترة', () => {
  it('بحث في الملاحظات + نوع + شهر', () => {
    assert.equal(filterExpenses(data, { query: 'أوبر' }).length, 1);
    assert.equal(filterExpenses(data, { category: 'food' }).length, 3);
    assert.equal(filterExpenses(data, { category: 'food', month: '2026-10' }).length, 2);
    assert.equal(filterExpenses(data, { query: '  ' }).length, data.length);
    assert.equal(filterExpenses(data, { query: 'مش موجود' }).length, 0);
  });

  it('الشهور المتاحة', () => {
    assert.deepEqual(availableMonths(data), ['2026-10', '2026-09']);
  });
});
