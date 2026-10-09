import { addMonths, daysInMonth, monthKeyOf, parseMonthKey, startOfWeek, toDateKey } from './dates';
import type { CategoryId, DateKey, Expense, MonthKey } from './types';
import { CATEGORY_IDS } from './types';

export function totalOf(expenses: Expense[]): number {
  const sum = expenses.reduce((acc, e) => acc + e.amount, 0);
  return Math.round(sum * 100) / 100;
}

/** ترتيب من الأحدث للأقدم: بالتاريخ وبعدين بوقت الإضافة */
export function sortByNewest(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
  });
}

export function filterByMonth(expenses: Expense[], month: MonthKey): Expense[] {
  return expenses.filter((e) => monthKeyOf(e.date) === month);
}

export function filterByDateRange(expenses: Expense[], from: DateKey, to: DateKey): Expense[] {
  return expenses.filter((e) => e.date >= from && e.date <= to);
}

export function totalForDay(expenses: Expense[], day: DateKey): number {
  return totalOf(expenses.filter((e) => e.date === day));
}

/** إجمالي الأسبوع الحالي (من السبت لحد النهارده) */
export function totalForWeek(expenses: Expense[], today: DateKey): number {
  return totalOf(filterByDateRange(expenses, startOfWeek(today), today));
}

export function totalForMonth(expenses: Expense[], month: MonthKey): number {
  return totalOf(filterByMonth(expenses, month));
}

export type CategoryTotal = {
  category: CategoryId;
  total: number;
  /** من 0 لـ 100 */
  percent: number;
  count: number;
};

/** التجميع حسب النوع، مرتب من الأكبر للأصغر، ومن غير الأنواع اللي مجموعها صفر */
export function sumByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<CategoryId, { total: number; count: number }>();
  for (const e of expenses) {
    const cur = totals.get(e.category) ?? { total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    totals.set(e.category, cur);
  }
  const grand = totalOf(expenses);
  return CATEGORY_IDS.filter((id) => (totals.get(id)?.total ?? 0) > 0)
    .map((id) => {
      const { total, count } = totals.get(id)!;
      const rounded = Math.round(total * 100) / 100;
      return { category: id, total: rounded, count, percent: grand > 0 ? (rounded / grand) * 100 : 0 };
    })
    .sort((a, b) => b.total - a.total);
}

export function topCategory(expenses: Expense[]): CategoryTotal | null {
  return sumByCategory(expenses)[0] ?? null;
}

export type DayTotal = { day: number; date: DateKey; total: number };

/** إجمالي كل يوم في الشهر (طول المصفوفة = عدد أيام الشهر) */
export function sumByDay(expenses: Expense[], month: MonthKey): DayTotal[] {
  const { year, month: m } = parseMonthKey(month);
  const count = daysInMonth(month);
  const totals = new Array<number>(count).fill(0);
  for (const e of expenses) {
    if (monthKeyOf(e.date) !== month) continue;
    const day = Number(e.date.slice(8, 10));
    totals[day - 1] += e.amount;
  }
  return totals.map((total, i) => ({
    day: i + 1,
    date: toDateKey(new Date(year, m, i + 1)),
    total: Math.round(total * 100) / 100,
  }));
}

export type DayGroup = { date: DateKey; total: number; data: Expense[] };

/** تقسيم المصاريف حسب اليوم (للقوائم)، من الأحدث للأقدم */
export function groupByDay(expenses: Expense[]): DayGroup[] {
  const groups: DayGroup[] = [];
  let current: DayGroup | null = null;
  for (const e of sortByNewest(expenses)) {
    if (!current || current.date !== e.date) {
      current = { date: e.date, total: 0, data: [] };
      groups.push(current);
    }
    current.data.push(e);
    current.total = Math.round((current.total + e.amount) * 100) / 100;
  }
  return groups;
}

export type MonthComparison = {
  current: number;
  previous: number;
  /** نسبة التغيير، null لو الشهر اللي فات مفيهوش مصاريف */
  changePercent: number | null;
  direction: 'up' | 'down' | 'same';
};

export function compareWithPreviousMonth(expenses: Expense[], month: MonthKey): MonthComparison {
  const current = totalForMonth(expenses, month);
  const previous = totalForMonth(expenses, addMonths(month, -1));
  const direction = current > previous ? 'up' : current < previous ? 'down' : 'same';
  const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : null;
  return { current, previous, changePercent, direction };
}

/**
 * متوسط الصرف اليومي في الشهر.
 * لو الشهر هو الشهر الحالي بنقسم على الأيام اللي عدّت لحد النهارده بس.
 * لو الشهر في المستقبل بيرجع صفر.
 */
export function averageDaily(expenses: Expense[], month: MonthKey, today: DateKey): number {
  const todayMonth = monthKeyOf(today);
  if (month > todayMonth) return 0;
  const days = month === todayMonth ? Number(today.slice(8, 10)) : daysInMonth(month);
  if (days <= 0) return 0;
  return Math.round((totalForMonth(expenses, month) / days) * 100) / 100;
}

export type BudgetStatus = {
  budget: number;
  spent: number;
  remaining: number;
  /** نسبة الصرف من الميزانية (ممكن تعدي 1) */
  ratio: number;
  isOver: boolean;
};

export function budgetStatus(spent: number, budget: number | null): BudgetStatus | null {
  if (budget === null || !(budget > 0)) return null;
  const remaining = Math.round((budget - spent) * 100) / 100;
  return { budget, spent, remaining, ratio: spent / budget, isOver: spent > budget };
}

export type ExpenseFilter = {
  query?: string;
  category?: CategoryId | null;
  month?: MonthKey | null;
};

/** البحث في الملاحظات + فلتر النوع والشهر */
export function filterExpenses(expenses: Expense[], filter: ExpenseFilter): Expense[] {
  const q = filter.query?.trim().toLowerCase() ?? '';
  return expenses.filter((e) => {
    if (filter.category && e.category !== filter.category) return false;
    if (filter.month && monthKeyOf(e.date) !== filter.month) return false;
    if (q && !e.note.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** كل الشهور اللي فيها مصاريف، من الأحدث للأقدم */
export function availableMonths(expenses: Expense[]): MonthKey[] {
  return Array.from(new Set(expenses.map((e) => monthKeyOf(e.date)))).sort().reverse();
}
