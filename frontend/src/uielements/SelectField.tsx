import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { UIElement, type DrawContext, type UIElementInit } from './UIElement';
import { FieldInfo } from './FieldInfo';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldInit extends UIElementInit {
  options: SelectOption[];
  placeholder?: string;
  /** When false, the empty "choose a value" option is not rendered. Default true. */
  includePlaceholder?: boolean;
  /** When true and no value is selected, the first option becomes the default. Default false. */
  defaultFirst?: boolean;
}

export class SelectField extends UIElement {
  readonly options: SelectOption[];
  readonly placeholder?: string;
  readonly includePlaceholder: boolean;
  readonly defaultFirst: boolean;

  constructor(init: SelectFieldInit) {
    super(init);
    this.options = init.options;
    this.placeholder = init.placeholder;
    this.includePlaceholder = init.includePlaceholder ?? true;
    this.defaultFirst = init.defaultFirst ?? false;
  }

  draw(ctx: DrawContext): ReactNode {
    return <SelectFieldView element={this} ctx={ctx} />;
  }
}

function SelectFieldView({
  element,
  ctx,
}: {
  element: SelectField;
  ctx: DrawContext;
}) {
  const firstValue = element.options[0]?.value ?? '';

  useEffect(() => {
    if (element.defaultFirst && !ctx.value && firstValue) {
      ctx.onChange(firstValue);
    }
  }, [element.defaultFirst, ctx.value, firstValue, ctx.onChange]);

  return (
    <div className="form-group">
      <label htmlFor={element.id}>
        {element.label}
        {element.required ? ' *' : ''}
        <FieldInfo detail={element.detail} />
      </label>
      <select
        id={element.id}
        name={element.id}
        value={ctx.value}
        onChange={(e) => ctx.onChange(e.target.value)}
      >
        {element.includePlaceholder && (
          <option value="">
            {element.placeholder ?? 'Выберите значение'}
          </option>
        )}
        {element.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
