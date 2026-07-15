import { memo } from "react";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { KpiCriteriaRow as KpiCriteriaRowData, KpiSubRow, KpiCriteria } from "../types/form";

interface KpiCriteriaRowProps {
  title: string;
  data: KpiCriteriaRowData;
  criteria: KpiCriteria;
  horizon: number;
  stage1Label?: string;
  stage2Label?: string;
  stage3Label?: string;
  onSubRowChange: (subIndex: number, field: keyof KpiSubRow, value: string | number) => void;
  onCommentChange: (comment: string) => void;
  onAddSubRow: () => void;
  onRemoveSubRow?: (subIndex: number) => void;
}

function multiplier(criteria: KpiCriteria, key: string): number {
  return criteria[key] ?? 0;
}

function subRowStagePoints(row: KpiSubRow, criteria: KpiCriteria, stage: keyof KpiSubRow): number {
  const amount = Number(row[stage]) || 0;
  return amount * multiplier(criteria, row.criteria);
}

function KpiCriteriaRow({
  title,
  data,
  criteria,
  horizon,
  stage1Label = "1-й этап",
  stage2Label = "2-й этап",
  stage3Label = "3-й этап",
  onSubRowChange,
  onCommentChange,
  onAddSubRow,
  onRemoveSubRow,
}: KpiCriteriaRowProps) {
  const stages: (keyof KpiSubRow)[] = horizon >= 3 ? ["stage1", "stage2", "stage3"] : ["stage1", "stage2"];
  const stageLabels: Record<keyof KpiSubRow, string> = {
    stage1: stage1Label,
    stage2: stage2Label,
    stage3: stage3Label,
    criteria: "Критерий",
  };

  const pointsByStage = stages.map(
    (stage) => data.rows.reduce((sum, r) => sum + subRowStagePoints(r, criteria, stage), 0),
  );
  const totalPoints = pointsByStage.reduce((s, p) => s + p, 0);

  const criteriaOptions = Object.keys(criteria);

  return (
    <div className="form-group kpi-criteria-row">
      <h3>{title}</h3>

      {data.rows.map((row, i) => (
        <div className="kpe-row kpi-criteria-subrow" key={i}>
          <TextField
            label={stage1Label}
            type="number"
            min="0"
            hint="0"
            showHintBelowField={false}
            value={row.stage1 || ""}
            onChange={(v) => onSubRowChange(i, "stage1", v === "" ? 0 : parseFloat(v))}
          />
          <TextField
            label={stage2Label}
            type="number"
            min="0"
            hint="0"
            showHintBelowField={false}
            value={row.stage2 || ""}
            onChange={(v) => onSubRowChange(i, "stage2", v === "" ? 0 : parseFloat(v))}
          />
          {horizon >= 3 && (
            <TextField
              label={stage3Label}
              type="number"
              min="0"
              hint="0"
              showHintBelowField={false}
              value={row.stage3 || ""}
              onChange={(v) => onSubRowChange(i, "stage3", v === "" ? 0 : parseFloat(v))}
            />
          )}
          <div className="form-group kpi-criteria-select">
            <label>{stageLabels.criteria}</label>
            <select value={row.criteria} onChange={(e) => onSubRowChange(i, "criteria", e.target.value)}>
              <option value="">Выберите критерий</option>
              {criteriaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {row.criteria && <div className="field-hint">×{multiplier(criteria, row.criteria)}</div>}
          </div>
          {i > 0 && onRemoveSubRow && (
            <button
              type="button"
              className="remove-team-member"
              onClick={() => onRemoveSubRow(i)}
              aria-label="Удалить строку"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <div className="kpi-points-summary">
        Баллы по этапам:{" "}
        {pointsByStage.map((p, si) => `${stageLabels[stages[si]].replace(/ \(.*\)/, "")} — ${p}`).join(", ")}, Итого — {totalPoints}
      </div>

      <div className="team-controls">
        <button type="button" className="add-team-member-btn" onClick={onAddSubRow}>
          + Добавить строку
        </button>
      </div>

      <TextAreaField
        label="Комментарий руководителя"
        hint="Комментарий к КПЭ"
        value={data.comment}
        onChange={onCommentChange}
      />
    </div>
  );
}

export default memo(KpiCriteriaRow);
