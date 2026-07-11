interface BudgetTotalRowProps {
  year1: number;
  year2: number;
  year3: number;
  grandTotal: number;
  isCategoryA: boolean;
}

export default function BudgetTotalRow({
  year1,
  year2,
  year3,
  grandTotal,
  isCategoryA,
}: BudgetTotalRowProps) {
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
        </div>
        {isCategoryA && (
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
          </div>
        )}
        <div className="form-group">
          <label htmlFor="">
            <strong>ОБЩИЙ ИТОГО (тыс. руб.)</strong>
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
