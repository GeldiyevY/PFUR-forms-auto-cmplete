import { SelectField } from './SelectField';
import type { Category } from '../categories/Category';

export class CategorySelector extends SelectField {
  readonly categories: Category[];

  constructor(init: {
    id: string;
    label?: string;
    hint?: string;
    required?: boolean;
    testValue?: string;
    detail?: string | null;
    options: Category[];
    includePlaceholder?: boolean;
    defaultFirst?: boolean;
  }) {
    super({
      id: init.id,
      label: init.label ?? 'Категория проекта',
      hint: init.hint,
      required: init.required,
      options: init.options.map((c) => ({ value: c.code, label: c.label })),
      placeholder: 'Выберите категорию',
      testValue: init.testValue,
      detail: init.detail,
      includePlaceholder: init.includePlaceholder,
      defaultFirst: init.defaultFirst,
    });
    this.categories = init.options;
  }
}
