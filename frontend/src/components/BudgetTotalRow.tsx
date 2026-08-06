interface BudgetTotalRowProps {
  year1: number;
  year2: number;
  year3: number;
  grandTotal: number;
  horizon: number;
  /** Optional warning shown under each year's total field. */
  warnings?: Partial<Record<1 | 2 | 3, string>>;
}

export default function BudgetTotalRow({
  year1,
  year2,
  year3,
  grandTotal,
  horizon,
  warnings = {},
}: BudgetTotalRowProps) {
  const showYear3 = horizon >= 3;

  return (
    <div className="form-group total-row">
      <h4>
        <strong>ИТОГО:</strong>
      </h4>
      <div className="budget-row">
        <div className="form-group">
          <label htmlFor="">
            <strong>1 год (тыс. руб.)</strong>
          </label>
          <input
            type="number"
            readOnly
            className="readonly-field total-field"
            value={year1.toFixed(1)}
          />
          {warnings[1] && <div className="threshold-violation">{warnings[1]}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="">
            <strong>2 год (тыс. руб.)</strong>
          </label>
          <input
            type="number"
            readOnly
            className="readonly-field total-field"
            value={year2.toFixed(1)}
          />
          {warnings[2] && <div className="threshold-violation">{warnings[2]}</div>}
        </div>
        {showYear3 && (
          <div className="form-group">
            <label htmlFor="">
              <strong>3 год (тыс. руб.)</strong>
            </label>
            <input
              type="number"
              readOnly
              className="readonly-field total-field"
              value={year3.toFixed(1)}
            />
            {warnings[3] && <div className="threshold-violation">{warnings[3]}</div>}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="">
            <strong>ОБЩИЙ ИТОГ (тыс. руб.)</strong>
          </label>
          <input
            type="number"
            readOnly
            className="readonly-field total-field"
            value={grandTotal.toFixed(1)}
          />
        </div>
      </div>
    </div>
  );
}
