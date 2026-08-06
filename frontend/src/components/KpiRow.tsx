import { memo, type ReactNode } from 'react';
import TextField from './TextField';
import TextAreaField from './TextAreaField';
import ThresholdHint from './ThresholdHint';
import type { RangeInfo } from '../utils/thresholds';
import type { KpiStageData } from '../types/form';

interface KpiRowProps {
  title: string;
  data: KpiStageData;
  stage1Label?: string;
  stage2Label?: string;
  stage3Label?: string;
  horizon: number;
  onChange: (field: keyof KpiStageData, value: string | number) => void;
  thresholds?: Partial<Record<'stage1' | 'stage2' | 'stage3', RangeInfo>>;
  stageHints?: Partial<Record<'stage1' | 'stage2' | 'stage3', ReactNode>>;
}

function KpiRow({
  title,
  data,
  stage1Label = '1-й этап',
  stage2Label = '2-й этап',
  stage3Label = '3-й этап',
  horizon,
  onChange,
  thresholds,
  stageHints,
}: KpiRowProps) {
  return (
    <div className="form-group">
      <h3>{title}</h3>
      <div className="kpe-row">
        <div>
          <TextField
            label={stage1Label}
            type="number"
            min="0"
            hint="-"
            showHintBelowField={false}
            value={data.stage1 || ''}
            onChange={(v) => onChange('stage1', v === '' ? 0 : parseFloat(v))}
          />
          <ThresholdHint value={data.stage1} range={thresholds?.stage1} />
          {stageHints?.stage1}
        </div>
        <div>
          <TextField
            label={stage2Label}
            type="number"
            min="0"
            hint="-"
            showHintBelowField={false}
            value={data.stage2 || ''}
            onChange={(v) => onChange('stage2', v === '' ? 0 : parseFloat(v))}
          />
          <ThresholdHint value={data.stage2} range={thresholds?.stage2} />
          {stageHints?.stage2}
        </div>
        {horizon >= 3 && (
          <div>
            <TextField
              label={stage3Label}
              type="number"
              min="0"
              hint="-"
              showHintBelowField={false}
              value={data.stage3 || ''}
              onChange={(v) => onChange('stage3', v === '' ? 0 : parseFloat(v))}
            />
            <ThresholdHint value={data.stage3} range={thresholds?.stage3} />
            {stageHints?.stage3}
          </div>
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
