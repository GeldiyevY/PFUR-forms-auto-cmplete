import ExpenseCategory from '../components/ExpenseCategory';
import type { ExpenseCategoryType, ExpenseItem } from '../types/form';

interface ExpenseBreakdownProps {
  items: Record<ExpenseCategoryType, ExpenseItem[]>;
  totals: Record<
    ExpenseCategoryType,
    { totalQuantity: number; totalSum: number; avgPrice: number }
  >;
  onAddItem: (category: ExpenseCategoryType) => void;
  onUpdateItem: (
    category: ExpenseCategoryType,
    id: number,
    field: 'name' | 'quantity' | 'price',
    value: string | number,
  ) => void;
  onRemoveItem: (category: ExpenseCategoryType, id: number) => void;
}

const CATEGORIES: {
  type: ExpenseCategoryType;
  title: string;
  prefix: string;
  placeholderName: string;
}[] = [
  {
    type: 'equipment',
    title: '1. Закупка (модернизация) оборудования, материалов, комплектующих',
    prefix: 'eq',
    placeholderName: 'Название оборудования',
  },
  {
    type: 'travel',
    title: '2. Командировки членов научного коллектива',
    prefix: 'tr',
    placeholderName: 'Описание командировки',
  },
  {
    type: 'services',
    title: '3. Оплата НТУ / работ сторонних организаций',
    prefix: 'sv',
    placeholderName: 'Описание услуги',
  },
  {
    type: 'other',
    title: '4. Прочие расходы, непосредственно связанные с выполняемым проектом',
    prefix: 'ot',
    placeholderName: 'Описание расхода',
  },
];

export default function ExpenseBreakdown({
  items,
  totals,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ExpenseBreakdownProps) {
  return (
    <>
      <p style={{ color: '#666', fontSize: 14, margin: '10px 0 20px' }}>
      Детальная расшифровка всех категорий расходов с автоматическим подсчетом итогов по столбцам
    </p>

    {CATEGORIES.map((cat) => (
        <ExpenseCategory
          key={cat.type}
          category={cat.type}
          title={cat.title}
          prefix={cat.prefix}
          placeholderName={cat.placeholderName}
          items={items[cat.type]}
          totals={totals[cat.type]}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </>
  );
}
