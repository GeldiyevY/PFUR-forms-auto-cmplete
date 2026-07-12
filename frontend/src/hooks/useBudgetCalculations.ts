import { useState, useCallback } from 'react';
import type { BudgetLine } from '../types/form';

function createEmptyLine(): BudgetLine {
  return { year1: 0, year2: 0, year3: 0 };
}

export type BudgetKey = 'payroll' | 'equipment' | 'materials' | 'travel' | 'services' | 'other';

const BUDGET_KEYS: BudgetKey[] = [
  'payroll',
  'equipment',
  'materials',
  'travel',
  'services',
  'other',
];

export function useBudgetCalculations(horizon: number) {
  const [lines, setLines] = useState<Record<BudgetKey, BudgetLine>>(() => {
    const initial: Record<string, BudgetLine> = {};
    for (const key of BUDGET_KEYS) initial[key] = createEmptyLine();
    return initial as Record<BudgetKey, BudgetLine>;
  });

  const updateLine = useCallback(
    (key: BudgetKey, field: 'year1' | 'year2' | 'year3', value: number) => {
      setLines((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: value },
      }));
    },
    [],
  );

  const showYear3 = horizon >= 3;

  const totals = BUDGET_KEYS.map((key) => {
    const line = lines[key];
    const total = line.year1 + line.year2 + (showYear3 ? line.year3 : 0);
    return { ...line, total };
  });

  const year1Total = totals.reduce((s, l) => s + l.year1, 0);
  const year2Total = totals.reduce((s, l) => s + l.year2, 0);
  const year3Total = showYear3 ? totals.reduce((s, l) => s + l.year3, 0) : 0;
  const grandTotal = year1Total + year2Total + year3Total;

  return {
    lines,
    totals,
    year1Total,
    year2Total,
    year3Total,
    grandTotal,
    updateLine,
  };
}
