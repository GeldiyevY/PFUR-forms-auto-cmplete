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

export default function ExpenseItemRow({
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
        <div className="form-group">
          <label htmlFor="">Наименование</label>
          <input
            type="text"
            name={`${prefix}_${item.id}_name`}
            placeholder={placeholderName}
            value={item.name}
            onChange={(e) => onUpdate(category, item.id, 'name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Количество</label>
          <input
            type="number"
            name={`${prefix}_${item.id}_quantity`}
            min="0"
            step="1"
            placeholder="1"
            value={item.quantity || ''}
            onChange={(e) =>
              onUpdate(category, item.id, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Цена за ед. (тыс. руб.)</label>
          <input
            type="number"
            name={`${prefix}_${item.id}_price`}
            min="0"
            step="0.1"
            placeholder="0.0"
            value={item.price || ''}
            onChange={(e) =>
              onUpdate(category, item.id, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))
            }
          />
        </div>
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
