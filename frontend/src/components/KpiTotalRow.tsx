import { memo } from "react";
import TextField from "./TextField";

interface KpiTotalRowProps {
  points: { stage1: number; stage2: number; stage3: number; total: number };
  horizon: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

function KpiTotalRow({ points, horizon }: KpiTotalRowProps) {
  return (
    <div className="form-group kpi-formula-row kpi-total-row">
      <h4 className="kpi-formula-title">Суммарные баллы (итого по КПЭ)</h4>
      <div className="kpe-row kpi-formula-fields">
        <TextField
          label=""
          underField="1-й этап (баллы)"
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(points.stage1)}
          onChange={() => {}}
        />
        <TextField
          label=""
          underField="2-й этап (баллы)"
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(points.stage2)}
          onChange={() => {}}
        />
        {horizon >= 3 && (
          <TextField
            label=""
            underField="3-й этап (баллы)"
            underFieldColor="#000"
            type="number"
            readOnly
            value={round(points.stage3)}
            onChange={() => {}}
          />
        )}
        <TextField
          label=""
          underField="Сумма баллов"
          underFieldColor="#000"
          type="number"
          readOnly
          value={round(points.total)}
          onChange={() => {}}
        />
      </div>
    </div>
  );
}

export default memo(KpiTotalRow);
