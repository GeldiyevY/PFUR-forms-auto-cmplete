import { memo } from 'react';
import TextField from './TextField';

interface BudgetRowProps {
  label: string;
  year1: number;
  year2: number;
  year3: number;
  total: number;
  horizon: number;
  onChange: (field: 'year1' | 'year2' | 'year3', value: number) => void;
}

function BudgetRow({
  label,
  year1,
  year2,
  year3,
  total,
  horizon,
  onChange,
}: BudgetRowProps) {
  const showYear3 = horizon >= 3;

  return (
    <div className="form-group">
      <h4>{label}</h4>
      <div className="budget-row">
        <TextField
          label="1 год (тыс. руб.)"
          type="number"
          min="0"
          step="0.1"
          hint="0.0"
          showHintBelowField={false}
          value={year1 || ''}
          onChange={(v) => onChange('year1', v === '' ? 0 : parseFloat(v))}
        />
        <TextField
          label="2 год (тыс. руб.)"
          type="number"
          min="0"
          step="0.1"
          hint="0.0"
          showHintBelowField={false}
          value={year2 || ''}
          onChange={(v) => onChange('year2', v === '' ? 0 : parseFloat(v))}
        />
        {showYear3 && (
          <TextField
            label="3 год (тыс. руб.)"
            type="number"
            min="0"
            step="0.1"
            hint="0.0"
            showHintBelowField={false}
            value={year3 || ''}
            onChange={(v) => onChange('year3', v === '' ? 0 : parseFloat(v))}
          />
        )}
        <div className="form-group">
          <label htmlFor="">Итого (тыс. руб.)</label>
          <input
            type="number"
            readOnly
            className="readonly-field"
            value={total.toFixed(1)}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(BudgetRow);
