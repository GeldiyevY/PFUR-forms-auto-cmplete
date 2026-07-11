interface BudgetRowProps {
  label: string;
  year1: number;
  year2: number;
  year3: number;
  total: number;
  isCategoryA: boolean;
  onChange: (field: 'year1' | 'year2' | 'year3', value: number) => void;
}

export default function BudgetRow({
  label,
  year1,
  year2,
  year3,
  total,
  isCategoryA,
  onChange,
}: BudgetRowProps) {
  const handleChange =
    (field: 'year1' | 'year2' | 'year3') => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.value === '' ? 0 : parseFloat(e.target.value));
    };

  return (
    <div className="form-group">
      <h4>{label}</h4>
      <div className="budget-row">
        <div className="form-group">
          <label htmlFor="">1 год (тыс. руб.)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={year1 || ''}
            onChange={handleChange('year1')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">2 год (тыс. руб.)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={year2 || ''}
            onChange={handleChange('year2')}
          />
        </div>
        <div className={`form-group${isCategoryA ? '' : ' category-a-only'}`}>
          <label htmlFor="">
            3 год (тыс. руб.){!isCategoryA ? ' - только для категории А' : ''}
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={isCategoryA ? (year3 || '') : ''}
            onChange={isCategoryA ? handleChange('year3') : undefined}
            readOnly={!isCategoryA}
            className={!isCategoryA ? 'readonly-field' : ''}
          />
        </div>
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
