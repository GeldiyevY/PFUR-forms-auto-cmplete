import KpiRow from '../components/KpiRow';
import KpiCriteriaRow from '../components/KpiCriteriaRow';
import KpiFormulaRow from '../components/KpiFormulaRow';
import KpiTotalRow from '../components/KpiTotalRow';
import { FieldInfo } from '../uielements/FieldInfo';
import type { KpiData, KpiCriteria, KpiSubRow } from '../types/form';

interface KpiSectionProps {
  data: KpiData;
  horizon: number;
  onChange: (kpeIndex: string, field: string, value: string | number) => void;
  onCriteriaChange: (kpeId: string, subIndex: number, field: keyof KpiSubRow, value: string | number) => void;
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
  minTotalPoints: Record<string, number>;
  categoryCode: string;
}

interface RowConfig {
  title: string;
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
    title: "КПЭ-6: Подготовка заявки на участие в следующем этапе Системы грантовой поддержки РУДН",
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
};

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
  minTotalPoints,
  categoryCode,
}: KpiSectionProps) {
  const criteriaFor = (kpeId: keyof KpiData): KpiCriteria =>
    kpeId === "kpe1" ? firstFieldCriteria : kpeId === "kpe3" ? thirdFieldCriteria : fifthFieldCriteria;

  const criteriaStagePoints = (
    rows: KpiSubRow[],
    crit: KpiCriteria,
    stage: keyof KpiSubRow,
  ): number =>
    rows.reduce((sum, r) => sum + (Number(r[stage]) || 0) * (crit[r.criteria] ?? 0), 0);

  const renderSimple = (kpeId: keyof KpiData) => {
    const cfg = ROWS[kpeId];
    return (
      <KpiRow
        key={kpeId}
        title={cfg.title}
        data={data[kpeId] as KpiData["kpe2"]}
        horizon={horizon}
        stage1Label={cfg.stage1Label}
        stage2Label={cfg.stage2Label}
        stage3Label={cfg.stage3Label}
        onChange={(field, value) => onChange(kpeId, field, value)}
      />
    );
  };

  const renderCriteria = (kpeId: keyof KpiData) => {
    const cfg = ROWS[kpeId];
    return (
      <KpiCriteriaRow
        key={kpeId}
        title={cfg.title}
        data={data[kpeId] as KpiData["kpe1"]}
        criteria={criteriaFor(kpeId)}
        horizon={horizon}
        stage1Label={cfg.stage1Label}
        stage2Label={cfg.stage2Label}
        stage3Label={cfg.stage3Label}
        onSubRowChange={(i, field, value) => onCriteriaChange(kpeId, i, field, value)}
        onCommentChange={(c) => onCommentChange(kpeId, c)}
        onAddSubRow={() => onAddSubRow(kpeId)}
        onRemoveSubRow={(i) => onRemoveSubRow(kpeId, i)}
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
  const perStageTotal = stages.map((stage) =>
    criteriaStagePoints(data.kpe1.rows, firstFieldCriteria, stage) +
    criteriaStagePoints(data.kpe3.rows, thirdFieldCriteria, stage) +
    criteriaStagePoints(data.kpe5.rows, fifthFieldCriteria, stage) +
    ((Number(kpe2[stage]) || 0) / 300) * 10,
  );
  const totals = {
    stage1: perStageTotal[0] ?? 0,
    stage2: perStageTotal[1] ?? 0,
    stage3: horizon >= 3 ? perStageTotal[2] ?? 0 : 0,
    total: perStageTotal.reduce((s, p) => s + p, 0),
  };

  const minTotal = categoryCode ? minTotalPoints[categoryCode] : undefined;
  const belowTotal = minTotal !== undefined && totals.total < minTotal;

  return (
    <>
      {label && (
        <h3 className="section-title">
          {label}
          <FieldInfo detail={detail ?? null} />
        </h3>
      )}

      {renderCriteria("kpe1")}

      {renderSimple("kpe2")}
      <KpiFormulaRow
        data={kpe2}
        horizon={horizon}
        stage1Label="1-й этап"
        stage2Label="2-й этап"
        stage3Label="3-й этап"
      />
      {min !== undefined && (
        <div className={`kpi-min-hint${belowMin ? " kpi-min-warning" : ""}`}>
          Минимальный объём внешнего финансирования для направления «{scienceField}»: {min} тыс. руб.
          {belowMin && ` — введено ${kpe2Total} тыс. руб., что ниже минимума.`}
        </div>
      )}

      {renderCriteria("kpe3")}
      {renderSimple("kpe4")}
      {renderCriteria("kpe5")}
      {renderSimple("kpe6")}
      {renderSimple("kpe7")}

      <KpiTotalRow points={totals} horizon={horizon} />
      {minTotal !== undefined && (
        <div className={`kpi-min-hint${belowTotal ? " kpi-min-warning" : ""}`}>
          Минимальное суммарное количество баллов для категории «{categoryCode}»: {minTotal}
          {belowTotal && ` — текущая сумма ${Math.round(totals.total * 100) / 100}, недостаточно.`}
        </div>
      )}
    </>
  );
}
