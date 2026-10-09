import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_CURRENCY } from '@/constants/currencies';

import { isValidDateKey } from './dates';
import type { Expense, Settings } from './types';
import { CATEGORY_IDS } from './types';

const EXPENSES_KEY = '@masarefy/expenses/v1';
const SETTINGS_KEY = '@masarefy/settings/v1';

export const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: null,
  currency: DEFAULT_CURRENCY,
};

/** بيتأكد إن العنصر المتخزن شكله صح، عشان بيانات بايظة ماتوقعش التطبيق */
export function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.amount === 'number' &&
    Number.isFinite(e.amount) &&
    e.amount > 0 &&
    typeof e.category === 'string' &&
    (CATEGORY_IDS as string[]).includes(e.category) &&
    isValidDateKey(e.date) &&
    typeof e.note === 'string' &&
    typeof e.createdAt === 'string'
  );
}

export async function loadExpenses(): Promise<Expense[]> {
  const raw = await AsyncStorage.getItem(EXPENSES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isExpense) : [];
  } catch {
    return [];
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      monthlyBudget:
        typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget > 0 ? parsed.monthlyBudget : null,
      currency:
        typeof parsed.currency === 'string' && parsed.currency.trim() ? parsed.currency : DEFAULT_CURRENCY,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([EXPENSES_KEY, SETTINGS_KEY]);
}
