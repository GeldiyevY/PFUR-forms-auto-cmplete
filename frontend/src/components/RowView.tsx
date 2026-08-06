import { useState, useEffect, memo } from "react";
import type { Row, RowData } from "../uielements/Row";
import { FieldInfo } from "../uielements/FieldInfo";

function RowView({ element }: { element: Row }) {
  const [rows, setRows] = useState<RowData[]>(
    element.rows.length > 0
      ? element.rows
      : Array.from({ length: element.minRows }, () => ({})),
  );

  useEffect(() => {
    element.rows = rows;
    element.setRows = setRows;
  }, [rows, element]);

  const updateCell = (rowIndex: number, fieldId: string, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, [fieldId]: value } : r)),
    );
  };

  const addRow = () => {
    if (rows.length >= element.maxRows) return;
    setRows((prev) => [...prev, {}]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= element.minRows) return;
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  return (
    <div className="form-group row-block">
      <h3 className="section-title row-section-title">
        <span className="row-title-text">
          {element.label}
          {element.required ? " *" : ""}
        </span>
        <FieldInfo detail={element.detail} />
      </h3>
      {element.hint && <div className="field-hint">{element.hint}</div>}

      {rows.map((row, ri) => {
        return (
          <div
            className="kpe-row kpi-criteria-subrow row-element-grid"
            key={ri}
          >
            {element.elements.map((el) => (
              <div key={el.id} className="row-element-cell">
                {el.render(row[el.id] ?? "", (v) => updateCell(ri, el.id, v))}
              </div>
            ))}
            {rows.length > element.minRows && (
              <button
                type="button"
                className="remove-team-member"
                onClick={() => removeRow(ri)}
                aria-label="Удалить строку"
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {element.increasable && rows.length < element.maxRows && (
        <div className="team-controls">
          <button
            type="button"
            className="add-team-member-btn row-add-btn"
            onClick={addRow}
          >
            + Добавить строку
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(RowView);
export { RowView };
