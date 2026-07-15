import { memo } from 'react';
import TextField from './TextField';
import type { ExpenseItem, ExpenseCategoryType } from '../types/form';

interface ExpenseItemRowProps {
  item: ExpenseItem;
  category: ExpenseCategoryType;
  prefix: string;
  placeholderName: string;
  onUpdate: (
    category: ExpenseCategoryType,
    id: number,
    field: 'name' | 'quantity' | 'price',
    value: string | number,
  ) => void;
  onRemove: (category: ExpenseCategoryType, id: number) => void;
}

function ExpenseItemRow({
  item,
  category,
  prefix,
  placeholderName,
  onUpdate,
  onRemove,
}: ExpenseItemRowProps) {
  const sum = (item.quantity || 0) * (item.price || 0);

  return (
    <div className="expense-item" data-category={category} data-item={item.id}>
      <div className="expense-row">
        <TextField
          label="Наименование"
          name={`${prefix}_${item.id}_name`}
          hint={placeholderName}
          value={item.name}
          onChange={(v) => onUpdate(category, item.id, 'name', v)}
        />
        <TextField
          label="Количество"
          type="number"
          min="0"
          step="1"
          hint="1"
          showHintBelowField={false}
          value={item.quantity || ''}
          onChange={(v) =>
            onUpdate(category, item.id, 'quantity', v === '' ? 0 : parseFloat(v))
          }
        />
        <TextField
          label="Цена за ед. (тыс. руб.)"
          type="number"
          min="0"
          step="0.1"
          hint="0.0"
          showHintBelowField={false}
          value={item.price || ''}
          onChange={(v) =>
            onUpdate(category, item.id, 'price', v === '' ? 0 : parseFloat(v))
          }
        />
        <div className="form-group">
          <label htmlFor="">Сумма (тыс. руб.)</label>
          <input
            type="number"
            name={`${prefix}_${item.id}_sum`}
            readOnly
            className="readonly-field"
            value={sum.toFixed(1)}
          />
        </div>
        <div className="form-group">
          <button
            type="button"
            className="remove-expense-item"
            onClick={() => onRemove(category, item.id)}
            title="Удалить позицию"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ExpenseItemRow);
