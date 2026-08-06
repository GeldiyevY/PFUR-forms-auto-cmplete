import { useState, useCallback, useEffect, memo } from "react";
import type { ReactNode } from "react";
import { UIElement, type DrawContext, type TestContext } from "./UIElement";
import KpiSection from "../sections/KpiSection";
import { createDefaultKpiData } from "../utils/defaults";
import type { KpiData, KpiCriteria, KpiSubRow } from "../types/form";

export interface KpiThresholdRule {
  /** Which КПЭ this rule applies to. */
  field: keyof KpiData;
  /** For criteria rows (kpe1/3/5): the sub-row index. Omit for all sub-rows. */
  subRow?: number;
  /** Stage the rule applies to. Omit/default = every stage. */
  stage?: 1 | 2 | 3 | "all";
  min?: number;
  max?: number;
  /** Optional custom warning message (auto-generated when omitted). */
  message?: string;
}

/** Minimum points required for a single stage. */
export interface KpiStageMin {
  stage: 1 | 2 | 3;
  min: number;
}

/**
 * Minimum-points rule scoped to a single research direction within a category.
 * `"others"` is a catch-all fallback and **must be last** in the list.
 */
export interface KpiMinPointsEntry {
  /** Research direction label or `"others"` (catch-all, must be last). */
  direction: string;
  /** Per-stage minimums. */
  minPerStage?: KpiStageMin[];
  /** Minimum total points across all stages. */
  minTotal: number;
}

/** Required minimum for a КПЭ per stage, keyed by ScienceField code. */
export interface KpiRequirement {
  /** Which КПЭ this requirement applies to. */
  field: keyof KpiData;
  /** Minimum raw count required for each applicable stage. */
  min: number;
  /** First stage the requirement applies to (default 1). */
  fromStage?: 1 | 2 | 3;
  /** Optional custom warning message (auto-generated when omitted). */
  message?: string;
}

/**
 * Resolve the correct `KpiMinPointsEntry` for a given research direction.
 *
 * Rules:
 * - If the list has one entry with `direction === "others"`, it applies to all.
 * - Otherwise, find the entry matching `scienceField`; if not found, fall back
 *   to the `"others"` entry (which must be last).
 * - If no match and no `"others"`, return `undefined` (no restrictions).
 */
export function resolveMinPointsEntry(
  entries: KpiMinPointsEntry[] | undefined,
  scienceField: string,
): KpiMinPointsEntry | undefined {
  if (!entries || entries.length === 0) return undefined;
  if (entries.length === 1 && entries[0].direction === "others") return entries[0];
  const match = entries.find((e) => e.direction === scienceField);
  if (match) return match;
  const fallback = entries.find((e) => e.direction === "others");
  return fallback;
}

/**
 * Validate that `"others"` (if present) is the last entry in each category's
 * list. Logs errors to console and returns a list of human-readable messages.
 */
export function validateMinPoints(
  minPoints: Record<string, KpiMinPointsEntry[]>,
): string[] {
  const errors: string[] = [];
  for (const [cat, entries] of Object.entries(minPoints)) {
    const othersIdx = entries.findIndex((e) => e.direction === "others");
    if (othersIdx === -1) continue;
    if (othersIdx !== entries.length - 1) {
      const msg = `minPoints["${cat}"]: "others" must be the last entry (found at index ${othersIdx}, list length ${entries.length})`;
      console.error(msg);
      errors.push(msg);
    }
  }
  return errors;
}

export interface KpiElementInit {
  firstFieldCriteria?: KpiCriteria;
  thirdFieldCriteria?: KpiCriteria;
  fifthFieldCriteria?: KpiCriteria;
  /** Minimum total external income (тыс. руб.) keyed by ScienceField code. */
  minYearIncome?: Record<string, number>;
  /**
   * Minimum points per stage + total, keyed by Category code ('А' / 'Б').
   * Each category maps to a list of direction-specific entries; `"others"`
   * acts as a catch-all fallback and must be the last element.
   */
  minPoints?: Record<string, KpiMinPointsEntry[]>;
  /** Per-field min/max warning rules, normally set by a chosen Direction.onApply. */
  kpiThresholds?: KpiThresholdRule[];
  /** Required per-stage КПЭ minimums keyed by ScienceField code. */
  requiredKpi?: Record<string, KpiRequirement[]>;
  /** Grant type this KPI table belongs to. Controls row set / numbering. */
  grantType?: "R1" | "D1";
  /**
   * Minimum fraction (0–1) of "Исследователи до 39 лет" relative to
   * "Состав научного коллектива" per stage. `null` = no check.
   */
  minPercent39?: number | null;
  /**
   * Minimum fraction (0–1) of "Студенты и/или аспиранты" relative to
   * "Состав научного коллектива" per stage. `null` = no check.
   */
  minPercentStudent?: number | null;
  /**
   * Minimum absolute number of "Студенты и/или аспиранты" required in at
   * least one stage. `null` = no check.
   */
  minStudents?: number | null;
}

export class KpiElement extends UIElement {
  kpiData: KpiData = createDefaultKpiData();
  setKpiData: (data: KpiData) => void = () => {};
  horizon: number = 3;

  firstFieldCriteria: KpiCriteria = {};
  thirdFieldCriteria: KpiCriteria = {};
  fifthFieldCriteria: KpiCriteria = {};
  minYearIncome: Record<string, number> = {};
  minPoints: Record<string, KpiMinPointsEntry[]> = {};
  kpiThresholds: KpiThresholdRule[] = [];
  requiredKpi: Record<string, KpiRequirement[]> = {};
  grantType: "R1" | "D1" = "R1";
  minPercent39: number | null = null;
  minPercentStudent: number | null = null;
  minStudents: number | null = null;

  constructor(init: KpiElementInit = {}) {
    super({ id: "kpi_table", label: "Ключевые показатели эффективности" });
    this.firstFieldCriteria = init.firstFieldCriteria ?? {};
    this.thirdFieldCriteria = init.thirdFieldCriteria ?? {};
    this.fifthFieldCriteria = init.fifthFieldCriteria ?? {};
    this.minYearIncome = init.minYearIncome ?? {};
    this.minPoints = init.minPoints ?? {};
    if (Object.keys(this.minPoints).length > 0) {
      validateMinPoints(this.minPoints);
    }
    this.kpiThresholds = init.kpiThresholds ?? [];
    this.requiredKpi = init.requiredKpi ?? {};
    this.grantType = init.grantType ?? "R1";
    this.minPercent39 = init.minPercent39 ?? null;
    this.minPercentStudent = init.minPercentStudent ?? null;
    this.minStudents = init.minStudents ?? null;
  }

  collectFor(): Record<string, unknown> {
    return this.collect();
  }

  /**
   * Ordered KPI rows + their docx `f3_<idx>` number, keyed by grant type.
   * `criteria: true` marks criteria-based rows (КПЭ-1/3/5).
   */
  rowSet(): { kpe: keyof KpiData; idx: number; criteria: boolean }[] {
    if (this.grantType === "D1") {
      return [
        { kpe: "kpe1", idx: 1, criteria: true },
        { kpe: "kpe2", idx: 2, criteria: false },
        { kpe: "kpe3", idx: 3, criteria: true },
        { kpe: "kpe4", idx: 4, criteria: false },
        { kpe: "kpe5", idx: 5, criteria: true },
        { kpe: "kpe6", idx: 6, criteria: false },
        { kpe: "kpe8", idx: 8, criteria: false },
        { kpe: "kpe9", idx: 9, criteria: false },
        { kpe: "kpe7", idx: 10, criteria: false },
      ];
    }
    return [
      { kpe: "kpe1", idx: 1, criteria: true },
      { kpe: "kpe2", idx: 2, criteria: false },
      { kpe: "kpe3", idx: 3, criteria: true },
      { kpe: "kpe4", idx: 4, criteria: false },
      { kpe: "kpe5", idx: 5, criteria: true },
      { kpe: "kpe6", idx: 6, criteria: false },
      { kpe: "kpe7", idx: 7, criteria: false },
    ];
  }

  collect(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const horizon = this.horizon >= 3 ? 3 : 2;
    const dash = (v: number | string): number | string =>
      v === 0 || v === "0" ? "-" : v;

    for (const { kpe, idx, criteria } of this.rowSet()) {
      const base = `f3_${idx}`;
      if (criteria) {
        const d = this.kpiData[kpe] as KpiData["kpe1"];
        const sum1 = d.rows.reduce((s, r) => s + (Number(r.stage1) || 0), 0);
        const sum2 = d.rows.reduce((s, r) => s + (Number(r.stage2) || 0), 0);
        const sum3 = d.rows.reduce((s, r) => s + (Number(r.stage3) || 0), 0);
        payload[`${base}_1`] = dash(sum1);
        payload[`${base}_2`] = dash(sum2);
        payload[`${base}_3`] = horizon >= 3 ? dash(sum3) : "";
        payload[`${base}_4`] = d.comment;
      } else {
        const d = this.kpiData[kpe] as KpiData["kpe2"];
        payload[`${base}_1`] = dash(d.stage1);
        payload[`${base}_2`] = dash(d.stage2);
        payload[`${base}_3`] = horizon >= 3 ? dash(d.stage3) : "";
        payload[`${base}_4`] = d.comment;
      }
    }

    return payload;
  }

  draw(ctx: DrawContext): ReactNode {
    return <KpiElementView element={this} ctx={ctx} />;
  }

  onTest(_ctx: TestContext): void {
    const lastCriteria = (obj: Record<string, number>): string => Object.keys(obj).at(-1) ?? "";
    this.setKpiData({
      kpe1: { rows: [{ stage1: 2, stage2: 3, stage3: 2, criteria: lastCriteria(this.firstFieldCriteria) }], comment: "Публикации в IEEE" },
      kpe2: { stage1: 500, stage2: 750, stage3: 1000, comment: "Гранты РНФ" },
      kpe3: { rows: [{ stage1: 2, stage2: 3, stage3: 2, criteria: lastCriteria(this.thirdFieldCriteria) }], comment: "ICML, NeurIPS" },
      kpe4: { stage1: 1, stage2: 1, stage3: 1, comment: "Патентование алгоритмов" },
      kpe5: { rows: [{ stage1: 0, stage2: 1, stage3: 2, criteria: lastCriteria(this.fifthFieldCriteria) }], comment: "Патенты на методы" },
      kpe6: { stage1: 0, stage2: 0, stage3: 1, comment: "Коммерциализация" },
      kpe7: { stage1: 3, stage2: 4, stage3: 5, comment: "Студенты и аспиранты" },
      kpe8: { stage1: 4, stage2: 5, stage3: 6, comment: "Состав коллектива" },
      kpe9: { stage1: 1, stage2: 2, stage3: 3, comment: "Исследователи" },
    });
  }
}

const KpiElementView = memo(function KpiElementView({
  element,
  ctx,
}: {
  element: KpiElement;
  ctx: DrawContext;
}) {
  const [kpiData, setKpiData] = useState<KpiData>(createDefaultKpiData);

  useEffect(() => {
    element.kpiData = kpiData;
    element.setKpiData = setKpiData;
  }, [kpiData, element]);

  const updateSimple = useCallback(
    (kpeId: string, field: string, value: string | number) => {
      setKpiData((prev) => ({
        ...prev,
        [kpeId]: { ...(prev[kpeId as keyof KpiData] as object), [field]: value },
      }));
    },
    [],
  );

  const updateCriteria = useCallback(
    (kpeId: string, subIndex: number, field: keyof KpiSubRow, value: string | number) => {
      setKpiData((prev) => {
        const row = prev[kpeId as keyof KpiData] as KpiData["kpe1"];
        const rows = row.rows.map((r, i) => (i === subIndex ? { ...r, [field]: value } : r));
        return { ...prev, [kpeId]: { ...row, rows } };
      });
    },
    [],
  );

  const updateComment = useCallback(
    (kpeId: string, comment: string) => {
      setKpiData((prev) => {
        const row = prev[kpeId as keyof KpiData] as KpiData["kpe1"];
        return { ...prev, [kpeId]: { ...row, comment } };
      });
    },
    [],
  );

  const addSubRow = useCallback(
    (kpeId: string) => {
      setKpiData((prev) => {
        const row = prev[kpeId as keyof KpiData] as KpiData["kpe1"];
        return {
          ...prev,
          [kpeId]: { ...row, rows: [...row.rows, { stage1: 0, stage2: 0, stage3: 0, criteria: "" }] },
        };
      });
    },
    [],
  );

  const removeSubRow = useCallback(
    (kpeId: string, subIndex: number) => {
      setKpiData((prev) => {
        const row = prev[kpeId as keyof KpiData] as KpiData["kpe1"];
        if (row.rows.length <= 1) return prev;
        return { ...prev, [kpeId]: { ...row, rows: row.rows.filter((_, i) => i !== subIndex) } };
      });
    },
    [],
  );

  const scienceField = ctx.values["research_direction"] ?? "";

  return (
    <KpiSection
      data={kpiData}
      horizon={element.horizon}
      onChange={updateSimple}
      onCriteriaChange={updateCriteria}
      onCommentChange={updateComment}
      onAddSubRow={addSubRow}
      onRemoveSubRow={removeSubRow}
      label={element.label}
      detail={element.detail}
      scienceField={scienceField}
      firstFieldCriteria={element.firstFieldCriteria}
      thirdFieldCriteria={element.thirdFieldCriteria}
      fifthFieldCriteria={element.fifthFieldCriteria}
      minYearIncome={element.minYearIncome}
      minPoints={element.minPoints}
      kpiThresholds={element.kpiThresholds}
      requiredKpi={element.requiredKpi}
      categoryCode={ctx.category?.code ?? ""}
      grantType={element.grantType}
      minPercent39={element.minPercent39}
      minPercentStudent={element.minPercentStudent}
      minStudents={element.minStudents}
    />
  );
});
