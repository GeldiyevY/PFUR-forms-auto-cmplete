import { SelectField } from './SelectField';
import type { ScienceField } from '../science_field/ScienceField';

export class ScienceFieldSelect extends SelectField {
  readonly scienceFields: ScienceField[];

  constructor(init: {
    id: string;
    label?: string;
    hint?: string;
    required?: boolean;
    testValue?: string;
    detail?: string | null;
    options: ScienceField[];
    includePlaceholder?: boolean;
    defaultFirst?: boolean;
  }) {
    super({
      id: init.id,
      label: init.label ?? 'Направление исследования',
      hint: init.hint,
      required: init.required,
      options: init.options.map((c) => ({ value: c.code, label: c.label })),
      placeholder: 'Выберите направление',
      testValue: init.testValue,
      detail: init.detail,
      includePlaceholder: init.includePlaceholder,
      defaultFirst: init.defaultFirst,
    });
    this.scienceFields = init.options;
  }
}
