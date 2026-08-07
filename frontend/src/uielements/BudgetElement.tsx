import { useEffect, useState, memo } from "react";
import type { ReactNode } from "react";
import { UIElement, type DrawContext, type TestContext } from "./UIElement";
import BudgetSection from "../sections/BudgetSection";
import ExpenseBreakdown from "../sections/ExpenseBreakdown";
import {
  useBudgetCalculations,
  type BudgetKey,
} from "../hooks/useBudgetCalculations";

export interface BudgetThresholdRule {
  /** Which budget line this rule applies to (single-line rule). */
  line?: BudgetKey;
  /** Several budget lines that are summed and checked together against the year total (group rule). */
  lines?: BudgetKey[];
  /** Year the rule applies to. Omit/default = every year. */
  year?: 1 | 2 | 3 | "all";
  min?: number;
  max?: number;
  /** Field value must be ≤ this fraction of the relevant year total (e.g. 0.1 = 10%). */
  maxPercent?: number;
  /** Sum of the specified lines must be ≥ this fraction of the relevant year total (e.g. 0.3 = 30%). */
  minPercent?: number;
  /** Optional custom warning message (auto-generated when omitted). */
  message?: string;
}
import { useTeamMembers } from "../hooks/useTeamMembers";
import { useExpenseItems } from "../hooks/useExpenseItems";
import type {
  ExpenseCategoryType,
  ExpenseItem,
  TeamMember,
} from "../types/form";

interface BudgetSnapshot {
  lines: Record<BudgetKey, { year1: number; year2: number; year3: number }>;
  totals: { total: number }[];
  year1Total: number;
  year2Total: number;
  year3Total: number;
  grandTotal: number;
  teamMembers: TeamMember[];
  teamTotalSalary: number;
  expenseItems: Record<ExpenseCategoryType, ExpenseItem[]>;
  horizon: number;
  leadName: string;
  grantType: "R1" | "D1";
  leftOverExplanation: string;
}

export class BudgetElement extends UIElement {
  horizon: number = 3;
  readonly leadFieldId: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  budgetThresholds: BudgetThresholdRule[] = [];
  /** Grant type this budget belongs to. Controls the D1-only leftover row. */
  grantType: "R1" | "D1" = "R1";
  snapshot: BudgetSnapshot | null = null;
  /** D1-only free-text justification for the leftover of funds (п.6.4). */
  leftOverExplanation: string = "";
  setLeftOverExplanation: (v: string) => void = () => {};
  api: {
    updateLine?: (
      k: BudgetKey,
      f: "year1" | "year2" | "year3",
      v: number,
    ) => void;
    addTeamMember?: () => void;
    removeTeamMember?: (id: number) => void;
    updateTeamMember?: (
      id: number,
      f: "name" | "salary",
      v: string | number,
    ) => void;
    addExpenseItem?: (c: ExpenseCategoryType) => number;
    updateExpenseItem?: (
      c: ExpenseCategoryType,
      id: number,
      f: "name" | "quantity" | "price",
      v: string | number,
    ) => void;
    removeExpenseItem?: (c: ExpenseCategoryType, id: number) => void;
  } = {};

  constructor(init?: {
    leadFieldId?: string;
    minTeamSize?: number;
    maxTeamSize?: number;
    budgetThresholds?: BudgetThresholdRule[];
    grantType?: "R1" | "D1";
  }) {
    super({ id: "budget_table", label: "Смета расходов" });
    this.leadFieldId = init?.leadFieldId ?? "head_of_project";
    this.minTeamSize = init?.minTeamSize;
    this.maxTeamSize = init?.maxTeamSize;
    this.budgetThresholds = init?.budgetThresholds ?? [];
    this.grantType = init?.grantType ?? "R1";
  }

  collectFor(): Record<string, unknown> {
    return this.collect();
  }

  collect(): Record<string, unknown> {
    if (!this.snapshot) return {};
    return buildBudgetPayload(this.snapshot);
  }

  draw(ctx: DrawContext): ReactNode {
    return (
      <BudgetElementView
        element={this}
        horizon={this.horizon}
        leadName={ctx.values[this.leadFieldId] || ""}
        minTeamSize={this.minTeamSize}
        maxTeamSize={this.maxTeamSize}
        budgetThresholds={this.budgetThresholds}
        grantType={this.grantType}
      />
    );
  }

  onTest(_ctx: TestContext): void {
    const budget: { key: BudgetKey; y1: number; y2: number; y3: number }[] = [
      { key: "payroll", y1: 800, y2: 850, y3: 900 },
      { key: "equipment", y1: 2500, y2: 1500, y3: 500 },
      { key: "materials", y1: 150, y2: 200, y3: 100 },
      { key: "travel", y1: 200, y2: 250, y3: 300 },
      { key: "services", y1: 300, y2: 200, y3: 150 },
      { key: "other", y1: 100, y2: 75, y3: 50 },
    ];
    const team = [
      {
        name: "Сидоров Сидор Сидорович, ведущий научный сотрудник, 0.5 ставки",
        salary: 200,
      },
      {
        name: "Александров Александр Александрович, аспирант, 0.25 ставки",
        salary: 100,
      },
      {
        name: "Николаева Наталья Николаевна, студент магистратуры, 0.1 ставки",
        salary: 50,
      },
    ];
    const equipment = [
      { name: "GPU-сервер NVIDIA A100 80GB", quantity: 1, price: 2000 },
      { name: "Рабочие станции для разработки", quantity: 2, price: 400 },
      { name: "SSD накопители 2TB", quantity: 4, price: 50 },
    ];

    const api = this.api;
    if (!api.updateLine) return;

    budget.forEach((b) => {
      api.updateLine!(b.key, "year1", b.y1);
      api.updateLine!(b.key, "year2", b.y2);
      api.updateLine!(b.key, "year3", b.y3);
    });

    api.addTeamMember!();
    team.forEach((m, i) => {
      api.updateTeamMember!(i + 2, "name", m.name);
      api.updateTeamMember!(i + 2, "salary", m.salary);
      if (i < team.length - 1) api.addTeamMember!();
    });

    equipment.forEach((item, i) => {
      const id = i === 0 ? 1 : api.addExpenseItem!("equipment");
      api.updateExpenseItem!("equipment", id, "name", item.name);
      api.updateExpenseItem!("equipment", id, "quantity", item.quantity);
      api.updateExpenseItem!("equipment", id, "price", item.price);
    });

    if (this.grantType === "D1") {
      this.setLeftOverExplanation(
        "Остаток средств от объёма, предусмотренного п.6.4 конкурсной документации, отсутствует.",
      );
    }
  }
}

function buildBudgetPayload(snapshot: BudgetSnapshot): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const {
    year1Total,
    year2Total,
    year3Total,
    grandTotal,
    horizon,
    teamMembers,
    teamTotalSalary,
    expenseItems,
    leadName,
  } = snapshot;

  if (horizon >= 3) payload["f4_7_3"] = year3Total.toFixed(1);
  else payload["f4_7_3"] = "0.0";
  payload["f4_7_1"] = year1Total.toFixed(1);
  payload["f4_7_2"] = year2Total.toFixed(1);
  payload["f4_7_4"] = grandTotal.toFixed(1);
  payload["f4_sum"] = teamTotalSalary.toFixed(1);

  if (snapshot.grantType === "D1") {
    payload["left_over_explanation"] = snapshot.leftOverExplanation;
  }

  const lineConfig: { key: BudgetKey; idx: number }[] = [
    { key: "payroll", idx: 1 },
    { key: "equipment", idx: 2 },
    { key: "materials", idx: 3 },
    { key: "travel", idx: 4 },
    { key: "services", idx: 5 },
    { key: "other", idx: 6 },
  ];

  for (const { key, idx } of lineConfig) {
    const line = snapshot.lines[key];
    const y1 = line.year1;
    const y2 = line.year2;
    const y3 = horizon >= 3 ? line.year3 : 0;
    const lineTotal = y1 + y2 + y3;
    payload[`f4_${idx}_1`] = y1.toFixed(1);
    payload[`f4_${idx}_2`] = y2.toFixed(1);
    payload[`f4_${idx}_3`] = y3.toFixed(1);
    payload[`f4_${idx}_4`] = lineTotal.toFixed(1);
  }

  const teamArray: Record<string, string | number>[] = [];
  for (const [idx, member] of teamMembers.entries()) {
    const n = idx + 1;
    const mName =
      n === 1
        ? (leadName || "Руководитель проекта") +
          ", руководитель проекта, 1.0 ставки"
        : member.name;
    teamArray.push({
      number: n,
      name: mName,
      salary: member.salary.toFixed(1),
    });
    payload[`student_${n}`] = mName;
    payload[`salary_${n}`] = member.salary.toFixed(1);
  }
  payload["team_members"] = teamArray;
  payload["team_count"] = teamArray.length;

  if (teamArray.length > 0) {
    const last = teamArray[teamArray.length - 1];
    payload["student_n"] = last.name;
    payload["salary_n"] = last.salary;
    payload["n"] = last.number;
  } else {
    payload["student_n"] = "";
    payload["salary_n"] = "0";
    payload["n"] = "1";
  }

  for (let i = teamArray.length + 1; i <= 10; i++) {
    payload[`student_${i}`] = "";
    payload[`salary_${i}`] = "0";
  }

  const catConfig: { type: ExpenseCategoryType; prefix: string }[] = [
    { type: "equipment", prefix: "eq" },
    { type: "travel", prefix: "tr" },
    { type: "services", prefix: "sv" },
    { type: "other", prefix: "ot" },
  ];

  for (const { type, prefix } of catConfig) {
    const items = expenseItems[type];
    const itemsArray: Record<string, string | number>[] = [];
    let totalQty = 0;
    let totalSum = 0;

    for (const [idx, item] of items.entries()) {
      const n = idx + 1;
      const sum = (item.quantity || 0) * (item.price || 0);
      itemsArray.push({
        [`${prefix}_number`]: n,
        [`${prefix}_name`]: item.name,
        [`${prefix}_quantity`]: (item.quantity || 0).toString(),
        [`${prefix}_price`]: (item.price || 0).toFixed(1),
        [`${prefix}_sum`]: sum.toFixed(1),
      });
      payload[`${prefix}_${n}_name`] = item.name;
      payload[`${prefix}_${n}_quantity`] = (item.quantity || 0).toString();
      payload[`${prefix}_${n}_price`] = (item.price || 0).toFixed(1);
      payload[`${prefix}_${n}_sum`] = sum.toFixed(1);
      totalQty += item.quantity || 0;
      totalSum += sum;
    }

    payload[`${type}_items`] = itemsArray;
    payload[`${prefix}_total_quantity`] = totalQty.toString();
    payload[`${prefix}_total_sum`] = totalSum.toFixed(1);
    payload[`${prefix}_total_price`] = (
      totalQty > 0 ? totalSum / totalQty : 0
    ).toFixed(1);

    for (let i = items.length + 1; i <= 10; i++) {
      payload[`${prefix}_${i}_name`] = "";
      payload[`${prefix}_${i}_quantity`] = "0";
      payload[`${prefix}_${i}_price`] = "0.0";
      payload[`${prefix}_${i}_sum`] = "0.0";
    }
  }

  return payload;
}

const BudgetElementView = memo(function BudgetElementView({
  element,
  horizon,
  leadName,
  minTeamSize,
  maxTeamSize,
  budgetThresholds,
  grantType,
}: {
  element: BudgetElement;
  horizon: number;
  leadName: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  budgetThresholds?: BudgetThresholdRule[];
  grantType: "R1" | "D1";
}) {
  const budget = useBudgetCalculations(horizon);
  const team = useTeamMembers(leadName);
  const expenses = useExpenseItems();
  const [leftOverExplanation, setLeftOverExplanation] = useState("");

  useEffect(() => {
    team.syncLeadName(leadName);
  }, [leadName]);

  useEffect(() => {
    element.leftOverExplanation = leftOverExplanation;
    element.setLeftOverExplanation = setLeftOverExplanation;
  }, [leftOverExplanation, element]);

  useEffect(() => {
    element.snapshot = {
      lines: budget.lines as BudgetSnapshot["lines"],
      totals: budget.totals,
      year1Total: budget.year1Total,
      year2Total: budget.year2Total,
      year3Total: budget.year3Total,
      grandTotal: budget.grandTotal,
      teamMembers: team.members,
      teamTotalSalary: team.totalSalary,
      expenseItems: expenses.items,
      horizon,
      leadName,
      grantType,
      leftOverExplanation,
    };
    element.api = {
      updateLine: budget.updateLine,
      addTeamMember: team.addMember,
      removeTeamMember: team.removeMember,
      updateTeamMember: team.updateMember,
      addExpenseItem: expenses.addItem,
      updateExpenseItem: expenses.updateItem,
      removeExpenseItem: expenses.removeItem,
    };
  }, [
    budget.lines,
    budget.totals,
    budget.year1Total,
    budget.year2Total,
    budget.year3Total,
    budget.grandTotal,
    team.members,
    team.totalSalary,
    expenses.items,
    horizon,
    leadName,
    grantType,
    leftOverExplanation,
  ]);

  return (
    <>
      <BudgetSection
        lines={budget.lines}
        totals={budget.totals}
        year1Total={budget.year1Total}
        year2Total={budget.year2Total}
        year3Total={budget.year3Total}
        grandTotal={budget.grandTotal}
        horizon={horizon}
        onBudgetChange={budget.updateLine}
        teamMembers={team.members}
        teamTotalSalary={team.totalSalary}
        leadName={leadName}
        onTeamUpdate={team.updateMember}
        onTeamRemove={team.removeMember}
        onTeamAdd={team.addMember}
        detail={element.detail}
        minTeamSize={minTeamSize}
        maxTeamSize={maxTeamSize}
        budgetThresholds={budgetThresholds}
      />
      <ExpenseBreakdown
        items={expenses.items}
        totals={expenses.totals}
        onAddItem={expenses.addItem}
        onUpdateItem={expenses.updateItem}
        onRemoveItem={expenses.removeItem}
      />
      {grantType === "D1" && (
        <div className="form-group">
          <label htmlFor="left_over_explanation">
            <strong>
              5. Размер и обоснование остатка средств от объема,
              предусмотренного п.6.4 конкурсной документации (при наличии).
            </strong>
          </label>
          <textarea
            id="left_over_explanation"
            name="left_over_explanation"
            rows={4}
            value={leftOverExplanation}
            onChange={(e) => setLeftOverExplanation(e.target.value)}
          />
        </div>
      )}
    </>
  );
});
