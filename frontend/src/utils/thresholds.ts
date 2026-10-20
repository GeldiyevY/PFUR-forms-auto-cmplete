export interface PercentMax {
  /** The fraction (e.g. 0.1 means 10%). */
  percent: number;
  /** The computed maximum value (percent of the relevant total). */
  maxValue: number;
}

export interface RangeInfo {
  min?: number;
  max?: number;
  /** Optional custom warning message (overrides the auto-generated one). */
  message?: string;
  /** Percent-based cap relative to a total (budget only). */
  percentMax?: PercentMax;
}

/** Black "range" hint shown when a field is empty. */
export function rangeHint(r: RangeInfo): string | null {
  const hasMin = r.min != null;
  const hasMax = r.max != null;
  if (!hasMin && !hasMax) return null;
  if (hasMin && hasMax) return `Диапазон: ${r.min}–${r.max}`;
  if (hasMin) return `Диапазон: ${r.min}–∞`;
  return `Диапазон: –∞–${r.max}`;
}

/** Red violation message shown when a value is outside [min, max]. */
export function violationMessage(value: number, r: RangeInfo): string | null {
  if (r.message) {
    if (r.min != null && value < r.min) return r.message;
    if (r.max != null && value > r.max) return r.message;
    return null;
  }
  if (r.min != null && value < r.min) return `Значение ниже минимума ${r.min}`;
  if (r.max != null && value > r.max) return `Значение выше максимума ${r.max}`;
  return null;
}

/** A 0 (the "empty" display value) is treated as an unfilled field. */
export function isEmptyValue(value: number | string): boolean {
  if (value === "" || value === null || value === undefined) return true;
  const n = Number(value);
  return Number.isNaN(n) || n === 0;
}

export type BudgetKey =
  | "payroll"
  | "equipment"
  | "materials"
  | "travel"
  | "services"
  | "other";

export interface BudgetLineValues {
  year1: number;
  year2: number;
  year3: number;
}

export interface BudgetGroupViolation {
  /** The year this violation applies to. */
  year: 1 | 2 | 3;
  /** Human-readable Russian warning for this year. */
  message: string;
}

/**
 * Evaluate group (multi-line) budget thresholds: for each rule with `lines`,
 * sum the specified lines for each applicable year and make sure the sum is
 * ≤ maxPercent and ≥ minPercent of that year's total.
 */
export function evaluateBudgetGroupThresholds(
  rules: {
    lines?: BudgetKey[];
    year?: 1 | 2 | 3 | "all";
    maxPercent?: number;
    minPercent?: number;
    message?: string;
  }[],
  lines: Record<BudgetKey, BudgetLineValues>,
  yearTotals: Record<1 | 2 | 3, number>,
  horizon: number,
): BudgetGroupViolation[] {
  const activeYears = (horizon >= 3 ? [1, 2, 3] : [1, 2]) as (1 | 2 | 3)[];
  const violations: BudgetGroupViolation[] = [];

  for (const rule of rules) {
    if (!rule.lines || rule.lines.length === 0) continue;
    const years = (rule.year ?? "all") === "all" ? activeYears : [rule.year as 1 | 2 | 3];

    for (const year of years) {
      const total = yearTotals[year];
      if (total <= 0) continue;

      const sum = rule.lines.reduce(
        (acc, key) => acc + (lines[key]?.[`year${year}`] ?? 0),
        0,
      );
      const fraction = sum / total;

      if (rule.maxPercent != null && fraction > rule.maxPercent) {
        const pctDisplay = (fraction * 100).toFixed(1);
        const maxDisplay = (rule.maxPercent * 100).toFixed(0);
        violations.push({
          year,
          message:
            rule.message ??
            `Сумма строк (${rule.lines.join(", ")}) за ${year}-й год составляет ${pctDisplay}% от итога по году — превышает допустимый максимум ${maxDisplay}%.`,
        });
      }
      if (rule.minPercent != null && fraction < rule.minPercent) {
        const pctDisplay = (fraction * 100).toFixed(1);
        const minDisplay = (rule.minPercent * 100).toFixed(0);
        violations.push({
          year,
          message:
            rule.message ??
            `Сумма строк (${rule.lines.join(", ")}) за ${year}-й год составляет ${pctDisplay}% от итога по году — ниже требуемого минимума ${minDisplay}%.`,
        });
      }
    }
  }

  return violations;
}
