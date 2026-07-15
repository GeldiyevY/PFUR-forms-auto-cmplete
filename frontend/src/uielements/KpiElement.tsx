import { useState, useCallback, useEffect, memo } from "react";
import type { ReactNode } from "react";
import { UIElement, type DrawContext, type TestContext } from "./UIElement";
import KpiSection from "../sections/KpiSection";
import { createDefaultKpiData } from "../utils/defaults";
import type { KpiData, KpiCriteria, KpiSubRow } from "../types/form";

export interface KpiElementInit {
  firstFieldCriteria?: KpiCriteria;
  thirdFieldCriteria?: KpiCriteria;
  fifthFieldCriteria?: KpiCriteria;
  /** Minimum total external income (тыс. руб.) keyed by ScienceField code. */
  minYearIncome?: Record<string, number>;
  /** Minimum total points keyed by Category code ('А' / 'Б'). */
  minTotalPoints?: Record<string, number>;
}

export class KpiElement extends UIElement {
  kpiData: KpiData = createDefaultKpiData();
  setKpiData: (data: KpiData) => void = () => {};
  horizon: number = 3;

  firstFieldCriteria: KpiCriteria = {};
  thirdFieldCriteria: KpiCriteria = {};
  fifthFieldCriteria: KpiCriteria = {};
  minYearIncome: Record<string, number> = {};
  minTotalPoints: Record<string, number> = {};

  constructor(init: KpiElementInit = {}) {
    super({ id: "kpi_table", label: "Ключевые показатели эффективности" });
    this.firstFieldCriteria = init.firstFieldCriteria ?? {};
    this.thirdFieldCriteria = init.thirdFieldCriteria ?? {};
    this.fifthFieldCriteria = init.fifthFieldCriteria ?? {};
    this.minYearIncome = init.minYearIncome ?? {};
    this.minTotalPoints = init.minTotalPoints ?? {};
  }

  collectFor(): Record<string, unknown> {
    return this.collect();
  }

  collect(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const horizon = this.horizon >= 3 ? 3 : 2;

    const criteriaRows: { kpe: keyof KpiData; idx: number }[] = [
      { kpe: "kpe1", idx: 1 },
      { kpe: "kpe3", idx: 3 },
      { kpe: "kpe5", idx: 5 },
    ];
    for (const { kpe, idx } of criteriaRows) {
      const d = this.kpiData[kpe] as KpiData["kpe1"];
      const base = `f3_${idx}`;
      const sum1 = d.rows.reduce((s, r) => s + (Number(r.stage1) || 0), 0);
      const sum2 = d.rows.reduce((s, r) => s + (Number(r.stage2) || 0), 0);
      const sum3 = d.rows.reduce((s, r) => s + (Number(r.stage3) || 0), 0);
      payload[`${base}_1`] = sum1;
      payload[`${base}_2`] = sum2;
      payload[`${base}_3`] = horizon >= 3 ? sum3 : "";
      payload[`${base}_4`] = d.comment;
    }

    const simpleRows: { kpe: keyof KpiData; idx: number }[] = [
      { kpe: "kpe2", idx: 2 },
      { kpe: "kpe4", idx: 4 },
      { kpe: "kpe6", idx: 6 },
      { kpe: "kpe7", idx: 7 },
    ];
    for (const { kpe, idx } of simpleRows) {
      const d = this.kpiData[kpe] as KpiData["kpe2"];
      const base = `f3_${idx}`;
      payload[`${base}_1`] = d.stage1;
      payload[`${base}_2`] = d.stage2;
      payload[`${base}_3`] = horizon >= 3 ? d.stage3 : "";
      payload[`${base}_4`] = d.comment;
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
      minTotalPoints={element.minTotalPoints}
      categoryCode={ctx.category?.code ?? ""}
    />
  );
});
