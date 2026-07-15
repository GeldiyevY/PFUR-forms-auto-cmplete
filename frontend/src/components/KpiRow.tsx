import { memo } from 'react';
import TextField from './TextField';
import TextAreaField from './TextAreaField';
import type { KpiStageData } from '../types/form';

interface KpiRowProps {
  title: string;
  data: KpiStageData;
  stage1Label?: string;
  stage2Label?: string;
  stage3Label?: string;
  horizon: number;
  onChange: (field: keyof KpiStageData, value: string | number) => void;
}

function KpiRow({
  title,
  data,
  stage1Label = '1-й этап',
  stage2Label = '2-й этап',
  stage3Label = '3-й этап',
  horizon,
  onChange,
}: KpiRowProps) {
  return (
    <div className="form-group">
      <h3>{title}</h3>
      <div className="kpe-row">
        <TextField
          label={stage1Label}
          type="number"
          min="0"
          hint="0"
          showHintBelowField={false}
          value={data.stage1 || ''}
          onChange={(v) => onChange('stage1', v === '' ? 0 : parseFloat(v))}
        />
        <TextField
          label={stage2Label}
          type="number"
          min="0"
          hint="0"
          showHintBelowField={false}
          value={data.stage2 || ''}
          onChange={(v) => onChange('stage2', v === '' ? 0 : parseFloat(v))}
        />
        {horizon >= 3 && (
          <TextField
            label={stage3Label}
            type="number"
            min="0"
            hint="0"
            showHintBelowField={false}
            value={data.stage3 || ''}
            onChange={(v) => onChange('stage3', v === '' ? 0 : parseFloat(v))}
          />
        )}
        <TextAreaField
          label="Комментарий руководителя"
          hint="Комментарий к КПЭ"
          className={horizon >= 3 ? undefined : 'kpe-comment-wide'}
          value={data.comment}
          onChange={(v) => onChange('comment', v)}
        />
      </div>
    </div>
  );
}

export default memo(KpiRow);
