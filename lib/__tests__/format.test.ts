/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { expensesToCsv } from '../csv';
import { addMonths, formatDayLabel, isValidDateKey, startOfWeek } from '../dates';
import { formatMoney, formatNumber, formatPercent, parseAmount, sanitizeAmountInput } from '../format';
import type { CategoryId } from '../types';

describe('المبالغ', () => {
  it('parseAmount بيقبل أرقام عربي وإنجليزي ويرفض الصفر والسالب', () => {
    assert.equal(parseAmount('150'), 150);
    assert.equal(parseAmount('١٥٠٫٥'), 150.5);
    assert.equal(parseAmount('12,25'), 12.25);
    assert.equal(parseAmount('0'), null);
    assert.equal(parseAmount('-5'), null);
    assert.equal(parseAmount(''), null);
    assert.equal(parseAmount('abc'), null);
    assert.equal(parseAmount('1.2.3'), null);
  });

  it('sanitizeAmountInput', () => {
    assert.equal(sanitizeAmountInput('١٢٣'), '123');
    assert.equal(sanitizeAmountInput('12.345'), '12.34');
    assert.equal(sanitizeAmountInput('1.2.3'), '1.23');
    assert.equal(sanitizeAmountInput('a5b'), '5');
  });

  it('التنسيق', () => {
    assert.equal(formatNumber(1234567), '1,234,567');
    assert.equal(formatNumber(1234.5), '1,234.50');
    assert.equal(formatNumber(-200), '-200');
    assert.equal(formatMoney(50, 'ج.م'), '50 ج.م');
    assert.equal(formatPercent(23.94), '23.9%');
    assert.equal(formatPercent(50), '50%');
  });
});

describe('التواريخ', () => {
  it('النهارده وامبارح', () => {
    assert.equal(formatDayLabel('2026-10-09', '2026-10-09'), 'النهارده');
    assert.equal(formatDayLabel('2026-10-08', '2026-10-09'), 'امبارح');
    assert.equal(formatDayLabel('2026-10-01', '2026-10-09'), 'الخميس، 1 أكتوبر');
    assert.equal(formatDayLabel('2025-12-31', '2026-01-01'), 'امبارح');
    assert.equal(formatDayLabel('2025-12-30', '2026-01-01'), 'التلات، 30 ديسمبر 2025');
  });

  it('حسابات الشهور والأسابيع', () => {
    assert.equal(addMonths('2026-01', -1), '2025-12');
    assert.equal(addMonths('2026-12', 1), '2027-01');
    assert.equal(startOfWeek('2026-10-09'), '2026-10-03');
    assert.equal(startOfWeek('2026-10-03'), '2026-10-03');
    assert.equal(isValidDateKey('2026-02-30'), false);
    assert.equal(isValidDateKey('2026-02-28'), true);
  });
});

describe('CSV', () => {
  it('بيهرّب الفواصل وعلامات التنصيص', () => {
    const labels = { food: 'أكل' } as Record<CategoryId, string>;
    const csv = expensesToCsv(
      [{ id: '1', amount: 10, category: 'food', date: '2026-10-09', note: 'شاي، "سكر", ولبن', createdAt: 'x' }],
      labels,
      'ج.م',
    );
    assert.ok(csv.startsWith('﻿'));
    const lines = csv.trim().split('\r\n');
    assert.equal(lines.length, 2);
    assert.equal(lines[1], '2026-10-09,أكل,10,ج.م,"شاي، ""سكر"", ولبن",x');
  });
});
