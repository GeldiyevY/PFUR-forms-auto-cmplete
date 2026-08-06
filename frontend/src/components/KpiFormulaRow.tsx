import { memo } from "react";
import TextField from "./TextField";
import type { KpiStageData } from "../types/form";

interface KpiFormulaRowProps {
  data: KpiStageData;
  horizon: number;
  stage1Label?: string;
  stage2Label?: string;
  stage3Label?: string;
}

function stagePoints(amount: number): number {
  return (Number(amount) || 0) / 300 * 10;
}

function KpiFormulaRow({
  data,
  horizon,
  stage1Label = "1-й этап",
  stage2Label = "2-й этап",
  stage3Label = "3-й этап",
}: KpiFormulaRowProps) {
  const p1 = stagePoints(data.stage1);
  const p2 = stagePoints(data.stage2);
  const p3 = stagePoints(data.stage3);
  const total = horizon >= 3 ? p1 + p2 + p3 : p1 + p2;

  const round = (n: number) => Math.round(n * 100) / 100;

  return (
    <div className="form-group kpi-formula-row">
      <h4 className="kpi-formula-title">
        Баллы КПЭ-2 (расчёт: сумма / 300 × 10)
      </h4>
      <div className="kpe-row kpi-formula-fields">
        <TextField
          label=""
          underField={`${stage1Label} (баллы)`}
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(p1)}
          onChange={() => {}}
        />
        <TextField
          label=""
          underField={`${stage2Label} (баллы)`}
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(p2)}
          onChange={() => {}}
        />
        {horizon >= 3 && (
          <TextField
            label=""
            underField={`${stage3Label} (баллы)`}
            underFieldColor="#000"
            type="number"
            readOnly
            value={round(p3)}
            onChange={() => {}}
          />
        )}
        <TextField
          label=""
          underField="Сумма баллов"
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(total)}
          onChange={() => {}}
        />
      </div>
    </div>
  );
}

export default memo(KpiFormulaRow);
