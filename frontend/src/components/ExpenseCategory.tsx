import type { ExpenseItem, ExpenseCategoryType } from '../types/form';
import ExpenseItemRow from './ExpenseItemRow';

interface ExpenseCategoryProps {
  category: ExpenseCategoryType;
  title: string;
  prefix: string;
  placeholderName: string;
  items: ExpenseItem[];
  totals: {
    totalQuantity: number;
    totalSum: number;
    avgPrice: number;
  };
  onAddItem: (category: ExpenseCategoryType) => void;
  onUpdateItem: (
    category: ExpenseCategoryType,
    id: number,
    field: 'name' | 'quantity' | 'price',
    value: string | number,
  ) => void;
  onRemoveItem: (category: ExpenseCategoryType, id: number) => void;
}

export default function ExpenseCategory({
  category,
  title,
  prefix,
  placeholderName,
  items,
  totals,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ExpenseCategoryProps) {
  return (
    <div className="expense-category">
      <h3>{title}</h3>
      <div className="expense-items" id={`${category}-items`}>
        {items.map((item) => (
          <ExpenseItemRow
            key={item.id}
            item={item}
            category={category}
            prefix={prefix}
            placeholderName={placeholderName}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
      <div className="expense-controls">
        <button
          type="button"
          className="add-expense-item-btn"
          onClick={() => onAddItem(category)}
        >
          ➕ Добавить позицию
        </button>
      </div>
      <div className="expense-totals">
        <div className="totals-row">
          <div className="form-group">
            <label>
              <strong>Итого:</strong>
            </label>
            <span>-</span>
          </div>
          <div className="form-group">
            <label>
              <strong>Количество</strong>
            </label>
            <input
              type="number"
              readOnly
              className="readonly-field total-field"
              value={totals.totalQuantity.toFixed(0)}
            />
          </div>
          <div className="form-group">
            <label>
              <strong>Средняя цена</strong>
            </label>
            <input
              type="number"
              readOnly
              className="readonly-field total-field"
              value={totals.avgPrice.toFixed(1)}
            />
          </div>
          <div className="form-group">
            <label>
              <strong>Общая сумма</strong>
            </label>
            <input
              type="number"
              readOnly
              className="readonly-field total-field"
              value={totals.totalSum.toFixed(1)}
            />
          </div>
          <div className="form-group">
            <span>-</span>
          </div>
        </div>
      </div>
    </div>
  );
}
