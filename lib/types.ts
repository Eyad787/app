export type CategoryId =
  | 'food'
  | 'transport'
  | 'bills'
  | 'outing'
  | 'shopping'
  | 'health'
  | 'education'
  | 'other';

export const CATEGORY_IDS: CategoryId[] = [
  'food',
  'transport',
  'bills',
  'outing',
  'shopping',
  'health',
  'education',
  'other',
];

/** تاريخ محلي بصيغة YYYY-MM-DD (من غير وقت عشان نتجنب مشاكل المناطق الزمنية). */
export type DateKey = string;

/** شهر بصيغة YYYY-MM */
export type MonthKey = string;

export type Expense = {
  id: string;
  amount: number;
  category: CategoryId;
  date: DateKey;
  note: string;
  /** ISO timestamp */
  createdAt: string;
};

export type ExpenseInput = Pick<Expense, 'amount' | 'category' | 'date' | 'note'>;

export type Settings = {
  /** الميزانية الشهرية، أو null لو مش متحددة */
  monthlyBudget: number | null;
  currency: string;
};
