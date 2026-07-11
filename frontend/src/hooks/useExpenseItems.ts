import { useState, useCallback, useMemo } from 'react';
import type { ExpenseItem, ExpenseCategoryType } from '../types/form';

let nextExpenseId = 100;

export function useExpenseItems() {
  const [items, setItems] = useState<Record<ExpenseCategoryType, ExpenseItem[]>>({
    equipment: [{ id: 1, name: '', quantity: 0, price: 0 }],
    travel: [{ id: 1, name: '', quantity: 0, price: 0 }],
    services: [{ id: 1, name: '', quantity: 0, price: 0 }],
    other: [{ id: 1, name: '', quantity: 0, price: 0 }],
  });

  const addItem = useCallback((category: ExpenseCategoryType) => {
    const id = nextExpenseId++;
    setItems((prev) => ({
      ...prev,
      [category]: [...prev[category], { id, name: '', quantity: 0, price: 0 }],
    }));
  }, []);

  const removeItem = useCallback((category: ExpenseCategoryType, id: number) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  }, []);

  const updateItem = useCallback(
    (
      category: ExpenseCategoryType,
      id: number,
      field: 'name' | 'quantity' | 'price',
      value: string | number,
    ) => {
      setItems((prev) => ({
        ...prev,
        [category]: prev[category].map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [],
  );

  const totals = useMemo(() => {
    const result: Record<ExpenseCategoryType, { totalQuantity: number; totalSum: number; avgPrice: number }> =
      {} as Record<ExpenseCategoryType, { totalQuantity: number; totalSum: number; avgPrice: number }>;

    for (const cat of ['equipment', 'travel', 'services', 'other'] as ExpenseCategoryType[]) {
      const totalQuantity = items[cat].reduce((s, i) => s + (i.quantity || 0), 0);
      const totalSum = items[cat].reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);
      const avgPrice = totalQuantity > 0 ? totalSum / totalQuantity : 0;
      result[cat] = { totalQuantity, totalSum, avgPrice };
    }
    return result;
  }, [items]);

  return { items, totals, addItem, removeItem, updateItem };
}
