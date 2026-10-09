import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { generateId } from './id';
import { DEFAULT_SETTINGS, clearAllData, loadExpenses, loadSettings, saveExpenses, saveSettings } from './storage';
import type { Expense, ExpenseInput, Settings } from './types';

type ExpensesContextValue = {
  expenses: Expense[];
  settings: Settings;
  isLoaded: boolean;
  addExpense: (input: ExpenseInput) => Expense;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => Promise<void>;
};

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // نسخة دايماً محدثة من البيانات عشان التعديلات المتتالية ماتضيعش بعض
  const expensesRef = useRef<Expense[]>([]);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  // طابور للحفظ عشان الكتابة على التخزين تحصل بالترتيب
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const enqueue = useCallback((task: () => Promise<void>) => {
    saveQueue.current = saveQueue.current.then(task).catch((err) => {
      console.warn('فشل حفظ البيانات', err);
    });
    return saveQueue.current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadExpenses(), loadSettings()])
      .then(([loadedExpenses, loadedSettings]) => {
        if (cancelled) return;
        expensesRef.current = loadedExpenses;
        settingsRef.current = loadedSettings;
        setExpenses(loadedExpenses);
        setSettings(loadedSettings);
      })
      .catch((err) => console.warn('فشل تحميل البيانات', err))
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commitExpenses = useCallback(
    (next: Expense[]) => {
      expensesRef.current = next;
      setExpenses(next);
      enqueue(() => saveExpenses(next));
    },
    [enqueue],
  );

  const addExpense = useCallback(
    (input: ExpenseInput) => {
      const expense: Expense = { ...input, id: generateId(), createdAt: new Date().toISOString() };
      commitExpenses([expense, ...expensesRef.current]);
      return expense;
    },
    [commitExpenses],
  );

  const updateExpense = useCallback(
    (id: string, input: ExpenseInput) => {
      commitExpenses(expensesRef.current.map((e) => (e.id === id ? { ...e, ...input } : e)));
    },
    [commitExpenses],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      commitExpenses(expensesRef.current.filter((e) => e.id !== id));
    },
    [commitExpenses],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      enqueue(() => saveSettings(next));
    },
    [enqueue],
  );

  const resetAll = useCallback(async () => {
    expensesRef.current = [];
    settingsRef.current = DEFAULT_SETTINGS;
    setExpenses([]);
    setSettings(DEFAULT_SETTINGS);
    await enqueue(clearAllData);
  }, [enqueue]);

  const value = useMemo(
    () => ({ expenses, settings, isLoaded, addExpense, updateExpense, deleteExpense, updateSettings, resetAll }),
    [expenses, settings, isLoaded, addExpense, updateExpense, deleteExpense, updateSettings, resetAll],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses لازم يتستخدم جوه ExpensesProvider');
  return ctx;
}
