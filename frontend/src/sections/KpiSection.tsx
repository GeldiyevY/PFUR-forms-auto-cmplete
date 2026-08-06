import KpiRow from "../components/KpiRow";
import KpiCriteriaRow from "../components/KpiCriteriaRow";
import KpiFormulaRow from "../components/KpiFormulaRow";
import KpiTotalRow from "../components/KpiTotalRow";
import { FieldInfo } from "../uielements/FieldInfo";
import { Fragment, type ReactNode } from "react";
import type { KpiData, KpiCriteria, KpiSubRow } from "../types/form";
import type { KpiThresholdRule } from "../uielements/KpiElement";
import type { KpiMinPointsEntry, KpiRequirement } from "../uielements/KpiElement";
import { resolveMinPointsEntry } from "../uielements/KpiElement";
import type { RangeInfo } from "../utils/thresholds";

interface KpiSectionProps {
  data: KpiData;
  horizon: number;
  onChange: (kpeIndex: string, field: string, value: string | number) => void;
  onCriteriaChange: (
    kpeId: string,
    subIndex: number,
    field: keyof KpiSubRow,
    value: string | number,
  ) => void;
  onCommentChange: (kpeId: string, comment: string) => void;
  onAddSubRow: (kpeId: string) => void;
  onRemoveSubRow: (kpeId: string, subIndex: number) => void;
  label?: string;
  detail?: string | null;
  scienceField?: string;
  firstFieldCriteria: KpiCriteria;
  thirdFieldCriteria: KpiCriteria;
  fifthFieldCriteria: KpiCriteria;
  minYearIncome: Record<string, number>;
  minPoints?: Record<string, KpiMinPointsEntry[]>;
  categoryCode: string;
  kpiThresholds?: KpiThresholdRule[];
  requiredKpi?: Record<string, KpiRequirement[]>;
  grantType?: "R1" | "D1";
  minPercent39?: number | null;
  minPercentStudent?: number | null;
  minStudents?: number | null;
}

interface RowConfig {
  title: string;
  stage1Label: string;
  stage2Label: string;
  stage3Label: string;
}

/** Ordered KPI rows per grant type. `criteria: true` for КПЭ-1/3/5. */
interface RowView {
  kpe: keyof KpiData;
  title: string;
  criteria: boolean;
  stage1Label: string;
  stage2Label: string;
  stage3Label: string;
}

const ROWS: Record<keyof KpiData, RowConfig> = {
  kpe1: {
    title: "КПЭ-1: Публикация статей в журналах WoS/Scopus",
    stage1Label: "1-й этап (статья)",
    stage2Label: "2-й этап (статья)",
    stage3Label: "3-й этап (статья)",
  },
  kpe2: {
    title: "КПЭ-2: Привлечение внешнего финансирования",
    stage1Label: "1-й этап (тыс. руб.)",
    stage2Label: "2-й этап (тыс. руб.)",
    stage3Label: "3-й этап (тыс. руб.)",
  },
  kpe3: {
    title: "КПЭ-3: Апробация результатов НИР/НИОКР на международных НТМ",
    stage1Label: "1-й этап (участие с публикацией)",
    stage2Label: "2-й этап (участие с публикацией)",
    stage3Label: "3-й этап (участие с публикацией)",
  },
  kpe4: {
    title: "КПЭ-4: Подача заявки на регистрацию РИД",
    stage1Label: "1-й этап (заявка на регистрацию)",
    stage2Label: "2-й этап (заявка на регистрацию)",
    stage3Label: "3-й этап (заявка на регистрацию)",
  },
  kpe5: {
    title: "КПЭ-5: Зарегистрированные РИД",
    stage1Label: "1-й этап (регистрация РИД)",
    stage2Label: "2-й этап (регистрация РИД)",
    stage3Label: "3-й этап (регистрация РИД)",
  },
  kpe6: {
    title:
      "КПЭ-6: Подготовка заявки на участие в следующем этапе Системы грантовой поддержки РУДН",
    stage1Label: "1-й этап (заявка)",
    stage2Label: "2-й этап (заявка)",
    stage3Label: "3-й этап (заявка)",
  },
  kpe7: {
    title: "КПЭ-7: Студенты и/или аспиранты в составе научного коллектива",
    stage1Label: "1-й этап (чел.)",
    stage2Label: "2-й этап (чел.)",
    stage3Label: "3-й этап (чел.)",
  },
  kpe8: {
    title: "8. Состав научного коллектива",
    stage1Label: "1-й этап (чел.)",
    stage2Label: "2-й этап (чел.)",
    stage3Label: "3-й этап (чел.)",
  },
  kpe9: {
    title:
      "9. Исследователи в возрасте до 39 лет (включительно) в составе научного коллектива",
    stage1Label: "1-й этап (чел.)",
    stage2Label: "2-й этап (чел.)",
    stage3Label: "3-й этап (чел.)",
  },
};

function rowsForGrantType(grantType: "R1" | "D1" | undefined): RowView[] {
  if (grantType === "D1") {
    return [
      { kpe: "kpe1", ...ROWS.kpe1, criteria: true },
      { kpe: "kpe2", ...ROWS.kpe2, criteria: false },
      { kpe: "kpe3", ...ROWS.kpe3, criteria: true },
      { kpe: "kpe4", ...ROWS.kpe4, criteria: false },
      { kpe: "kpe5", ...ROWS.kpe5, criteria: true },
      { kpe: "kpe6", ...ROWS.kpe6, criteria: false },
      { kpe: "kpe8", ...ROWS.kpe8, criteria: false },
      { kpe: "kpe9", ...ROWS.kpe9, criteria: false },
      {
        kpe: "kpe7",
        ...ROWS.kpe7,
        title: "10. " + ROWS.kpe7.title.replace(/^КПЭ-7:\s*/, ""),
        criteria: false,
      },
    ];
  }
  return [
    { kpe: "kpe1", ...ROWS.kpe1, criteria: true },
    { kpe: "kpe2", ...ROWS.kpe2, criteria: false },
    { kpe: "kpe3", ...ROWS.kpe3, criteria: true },
    { kpe: "kpe4", ...ROWS.kpe4, criteria: false },
    { kpe: "kpe5", ...ROWS.kpe5, criteria: true },
    { kpe: "kpe6", ...ROWS.kpe6, criteria: false },
    { kpe: "kpe7", ...ROWS.kpe7, criteria: false },
  ];
}

export default function KpiSection({
  data,
  horizon,
  onChange,
  onCriteriaChange,
  onCommentChange,
  onAddSubRow,
  onRemoveSubRow,
  label,
  detail,
  scienceField,
  firstFieldCriteria,
  thirdFieldCriteria,
  fifthFieldCriteria,
  minYearIncome,
  minPoints,
  categoryCode,
  kpiThresholds,
  requiredKpi,
  grantType,
  minPercent39,
  minPercentStudent,
  minStudents,
}: KpiSectionProps) {
  const rowViews = rowsForGrantType(grantType);
  const criteriaFor = (kpeId: keyof KpiData): KpiCriteria =>
    kpeId === "kpe1"
      ? firstFieldCriteria
      : kpeId === "kpe3"
        ? thirdFieldCriteria
        : fifthFieldCriteria;

  const criteriaStagePoints = (
    rows: KpiSubRow[],
    crit: KpiCriteria,
    stage: keyof KpiSubRow,
  ): number =>
    rows.reduce(
      (sum, r) => sum + (Number(r[stage]) || 0) * (crit[r.criteria] ?? 0),
      0,
    );

  const resolveKpi = (
    field: keyof KpiData,
    subRow: number | undefined,
    stage: 1 | 2 | 3,
  ): RangeInfo | undefined => {
    const matches = (kpiThresholds ?? []).filter((t) => {
      if (t.field !== field) return false;
      if (t.subRow !== undefined && subRow !== undefined && t.subRow !== subRow)
        return false;
      const s = t.stage ?? "all";
      if (s !== "all" && s !== stage) return false;
      return true;
    });
    if (matches.length === 0) return undefined;
    const merged: RangeInfo = {};
    for (const m of matches) {
      if (m.min != null) merged.min = Math.max(merged.min ?? -Infinity, m.min);
      if (m.max != null) merged.max = Math.min(merged.max ?? Infinity, m.max);
      if (m.message) merged.message = m.message;
    }
    return merged;
  };

  const renderSimple = (
    rv: RowView,
    stageHints?: Partial<Record<"stage1" | "stage2" | "stage3", ReactNode>>,
  ) => {
    const kpeId = rv.kpe;
    const thresholds: Partial<
      Record<"stage1" | "stage2" | "stage3", RangeInfo>
    > = {
      stage1: resolveKpi(kpeId, undefined, 1),
      stage2: resolveKpi(kpeId, undefined, 2),
      stage3: resolveKpi(kpeId, undefined, 3),
    };
    return (
      <KpiRow
        key={kpeId}
        title={rv.title}
        data={data[kpeId] as KpiData["kpe2"]}
        horizon={horizon}
        stage1Label={rv.stage1Label}
        stage2Label={rv.stage2Label}
        stage3Label={rv.stage3Label}
        onChange={(field, value) => onChange(kpeId, field, value)}
        thresholds={thresholds}
        stageHints={stageHints}
      />
    );
  };

  const renderCriteria = (rv: RowView) => {
    const kpeId = rv.kpe;
    const rows = data[kpeId] as KpiData["kpe1"];
    const thresholdsBySubRow: Record<
      number,
      Partial<Record<"stage1" | "stage2" | "stage3", RangeInfo>>
    > = {};
    rows.rows.forEach((_, i) => {
      thresholdsBySubRow[i] = {
        stage1: resolveKpi(kpeId, i, 1),
        stage2: resolveKpi(kpeId, i, 2),
        stage3: resolveKpi(kpeId, i, 3),
      };
    });
    return (
      <KpiCriteriaRow
        key={kpeId}
        title={rv.title}
        data={rows}
        criteria={criteriaFor(kpeId)}
        horizon={horizon}
        stage1Label={rv.stage1Label}
        stage2Label={rv.stage2Label}
        stage3Label={rv.stage3Label}
        onSubRowChange={(i, field, value) =>
          onCriteriaChange(kpeId, i, field, value)
        }
        onCommentChange={(c) => onCommentChange(kpeId, c)}
        onAddSubRow={() => onAddSubRow(kpeId)}
        onRemoveSubRow={(i) => onRemoveSubRow(kpeId, i)}
        thresholdsBySubRow={thresholdsBySubRow}
      />
    );
  };

  const min = scienceField ? minYearIncome[scienceField] : undefined;
  const kpe2 = data.kpe2;
  const kpe2Total =
    (Number(kpe2.stage1) || 0) +
    (Number(kpe2.stage2) || 0) +
    (horizon >= 3 ? Number(kpe2.stage3) || 0 : 0);
  const belowMin = min !== undefined && kpe2Total < min;

  const stages: ("stage1" | "stage2" | "stage3")[] =
    horizon >= 3 ? ["stage1", "stage2", "stage3"] : ["stage1", "stage2"];
  const perStageTotal = stages.map(
    (stage) =>
      criteriaStagePoints(data.kpe1.rows, firstFieldCriteria, stage) +
      criteriaStagePoints(data.kpe3.rows, thirdFieldCriteria, stage) +
      criteriaStagePoints(data.kpe5.rows, fifthFieldCriteria, stage) +
      ((Number(kpe2[stage]) || 0) / 300) * 10,
  );
  const totals = {
    stage1: perStageTotal[0] ?? 0,
    stage2: perStageTotal[1] ?? 0,
    stage3: horizon >= 3 ? (perStageTotal[2] ?? 0) : 0,
    total: perStageTotal.reduce((s, p) => s + p, 0),
  };

  const stageLabels: Record<"stage1" | "stage2" | "stage3", string> = {
    stage1: "1-й этап",
    stage2: "2-й этап",
    stage3: "3-й этап",
  };

  const perStageMin = categoryCode
    ? resolveMinPointsEntry(minPoints?.[categoryCode], scienceField ?? "")
    : undefined;
  const stageMinInfo = stages.map((s, i) => {
    const stageNum = (i + 1) as 1 | 2 | 3;
    const rule = perStageMin?.minPerStage?.find((r) => r.stage === stageNum);
    const min = rule?.min;
    return {
      stage: s,
      label: stageLabels[s],
      min,
      below: min != null && perStageTotal[i] < min,
      value: perStageTotal[i],
    };
  });
  const hasStageMin = stageMinInfo.some((x) => x.min != null);

  const minTotalVal = perStageMin?.minTotal;
  const belowTotal = minTotalVal !== undefined && totals.total < minTotalVal;

  // ── Per-stage percentage checks (D1 only: kpe8 = total team, kpe9 = under 39, kpe7 = students) ──
  const hasTeamRows = grantType === "D1";

  const CRITERIA_FIELDS: (keyof KpiData)[] = ["kpe1", "kpe3", "kpe5"];
  const rawStageCount = (
    field: keyof KpiData,
    stage: "stage1" | "stage2" | "stage3",
  ): number => {
    if (CRITERIA_FIELDS.includes(field)) {
      const row = data[field] as KpiData["kpe1"];
      return row.rows.reduce((s, r) => s + (Number(r[stage]) || 0), 0);
    }
    const row = data[field] as KpiData["kpe2"];
    return Number(row[stage]) || 0;
  };

  const reqRules = scienceField ? requiredKpi?.[scienceField] : undefined;
  const reqRowsByField = new Map<
    keyof KpiData,
    {
      key: string;
      stageLabel: string;
      min: number;
      value: number;
      below: boolean;
      message?: string;
    }[]
  >();
  for (const rule of reqRules ?? []) {
    const from = rule.fromStage ?? 1;
    const rows = stages
      .map((stage, i) => ({ stage, stageNum: (i + 1) as 1 | 2 | 3 }))
      .filter(({ stageNum }) => stageNum >= from)
      .map(({ stage, stageNum }) => {
        const value = rawStageCount(rule.field, stage);
        return {
          key: `${rule.field}-${stageNum}`,
          stageLabel: stageLabels[stage],
          min: rule.min,
          value,
          below: value < rule.min,
          message: rule.message,
        };
      });
    reqRowsByField.set(rule.field, [
      ...(reqRowsByField.get(rule.field) ?? []),
      ...rows,
    ]);
  }

  const renderRequirement = (field: keyof KpiData) => {
    const rows = reqRowsByField.get(field);
    if (!rows || rows.length === 0) return null;
    return (
      <div className="kpi-required-hints">
        {rows.map((r) => (
          <div
            key={r.key}
            className={`kpi-min-hint${r.below ? " kpi-min-warning" : ""}`}
          >
            {r.stageLabel}: минимум {r.min}
            {r.below &&
              (r.message
                ? ` — ${r.message}`
                : ` — текущее значение ${r.value}, недостаточно.`)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {label && (
        <h3 className="section-title">
          {label}
          <FieldInfo detail={detail ?? null} />
        </h3>
      )}

      {rowViews.map((rv) =>
        rv.criteria ? (
          <Fragment key={rv.kpe}>
            {renderCriteria(rv)}
            {renderRequirement(rv.kpe)}
          </Fragment>
        ) : rv.kpe === "kpe2" ? (
          <Fragment key={rv.kpe}>
            {renderSimple(rv)}
            <KpiFormulaRow
              data={kpe2}
              horizon={horizon}
              stage1Label="1-й этап"
              stage2Label="2-й этап"
              stage3Label="3-й этап"
            />
            {min !== undefined && (
              <div
                className={`kpi-min-hint${belowMin ? " kpi-min-warning" : ""}`}
              >
                Минимальный объём внешнего финансирования для направления «
                {scienceField}»: {min} тыс. руб.
                {belowMin &&
                  ` — введено ${kpe2Total} тыс. руб., что ниже минимума.`}
              </div>
            )}
            {renderRequirement(rv.kpe)}
          </Fragment>
        ) : (
          <Fragment key={rv.kpe}>
            {renderSimple(rv, (() => {
              if (!hasTeamRows) return undefined;
              const percent =
                rv.kpe === "kpe9" ? minPercent39 : rv.kpe === "kpe7" ? minPercentStudent : null;
              if (percent == null) return undefined;
              const totalRow = data.kpe8;
              const thisRow = data[rv.kpe] as KpiData["kpe8"];
              const hints: Partial<Record<"stage1" | "stage2" | "stage3", ReactNode>> = {};
              for (const s of stages) {
                const total = Number(totalRow[s]) || 0;
                const actual = Number(thisRow[s]) || 0;
                if (total > 0) {
                  const required = Math.ceil(percent * total);
                  const below = actual < required;
                  const pctDisplay = Math.round(percent * 100);
                  hints[s] = (
                    <div className={`kpi-min-hint${below ? " kpi-min-warning" : ""}`}>
                      ≥{pctDisplay}% ≈{required}
                    </div>
                  );
                }
              }
              return hints;
            })())}
            {rv.kpe === "kpe7" && minStudents != null && (() => {
              const kpe7 = data.kpe7;
              const total =
                (Number(kpe7.stage1) || 0) +
                (Number(kpe7.stage2) || 0) +
                (horizon >= 3 ? Number(kpe7.stage3) || 0 : 0);
              const below = total < minStudents;
              return (
                <div className={`kpi-min-hint${below ? " kpi-min-warning" : ""}`}>
                  Минимум студентов/аспирантов суммарно за все этапы: {minStudents}
                  {below &&
                    ` — сейчас ${total}, недостаточно.`}
                </div>
              );
            })()}
            {renderRequirement(rv.kpe)}
          </Fragment>
        ),
      )}

      <KpiTotalRow points={totals} horizon={horizon} />
      {hasStageMin && (
        <div className="kpi-perstage-hints">
          {stageMinInfo.map((x) =>
            x.min != null ? (
              <div
                key={x.stage}
                className={`kpi-min-hint${x.below ? " kpi-min-warning" : ""}`}
              >
                {x.label}: минимум {x.min} баллов
                {x.below &&
                  ` — текущая сумма ${Math.round(x.value * 100) / 100}, недостаточно.`}
              </div>
            ) : null,
          )}
        </div>
      )}
      {minTotalVal !== undefined && (
        <div className={`kpi-min-hint${belowTotal ? " kpi-min-warning" : ""}`}>
          Минимальное суммарное количество баллов для категории «{categoryCode}
          »: {minTotalVal}
          {belowTotal &&
            ` — текущая сумма ${Math.round(totals.total * 100) / 100}, недостаточно.`}
        </div>
      )}
    </>
  );
}
