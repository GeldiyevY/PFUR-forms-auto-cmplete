import { useState } from 'react';
import type { ReactNode } from 'react';
import { UIElement, type DrawContext, type UIElementInit } from './UIElement';
import { FieldInfo } from './FieldInfo';

export interface TextFieldInit extends UIElementInit {
  minChar?: number;
  maxChar?: number;
  type?: 'text' | 'number' | 'date';
  readOnly?: boolean;
  inputClassName?: string;
}

export class TextField extends UIElement {
  minChar?: number;
  maxChar?: number;
  readonly type: 'text' | 'number' | 'date';
  readonly readOnly: boolean;
  readonly inputClassName?: string;

  constructor(init: TextFieldInit) {
    super(init);
    this.minChar = init.minChar;
    this.maxChar = init.maxChar;
    this.type = init.type ?? 'text';
    this.readOnly = init.readOnly ?? false;
    this.inputClassName = init.inputClassName;
  }

  check(value: string): string | null {
    const len = value.trim().length;
    if (this.minChar && len > 0 && len < this.minChar) {
      return `Минимум символов: ${this.minChar} (сейчас ${len})`;
    }
    if (this.maxChar && len > this.maxChar) {
      return `Максимум символов: ${this.maxChar} (сейчас ${len})`;
    }
    return null;
  }

  draw(ctx: DrawContext): ReactNode {
    return <TextFieldView element={this} ctx={ctx} />;
  }
}

function TextFieldView({
  element,
  ctx,
}: {
  element: TextField;
  ctx: DrawContext;
}) {
  const [focused, setFocused] = useState(false);
  const value = ctx.value ?? '';
  const empty = value.trim() === '';
  const active = focused || !empty;
  const warning = element.check(value);
  const placeholder = empty && !focused && element.hint ? element.hint : undefined;
  const below = warning
    ? { text: warning, color: '#e65100' }
    : active && element.hint
      ? { text: element.hint, color: undefined }
      : null;

  return (
    <div className="form-group">
      <label htmlFor={element.id}>
        {element.label}
        {element.required ? ' *' : ''}
        <FieldInfo detail={element.detail} />
      </label>
      <input
        id={element.id}
        name={element.id}
        type={element.type}
        placeholder={placeholder}
        value={value}
        readOnly={element.readOnly}
        className={element.inputClassName}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => ctx.onChange(e.target.value)}
      />
      {below && (
        <div
          className="field-hint"
          style={below.color ? { color: below.color } : undefined}
        >
          {below.text}
        </div>
      )}
    </div>
  );
}
