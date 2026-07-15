import { useState } from 'react';
import type { ReactNode } from 'react';
import { UIElement, type DrawContext, type UIElementInit } from './UIElement';
import { FieldInfo } from './FieldInfo';

export interface TextAreaFieldInit extends UIElementInit {
  minChar?: number;
  maxChar?: number;
}

export class TextAreaField extends UIElement {
  minChar?: number;
  maxChar?: number;

  constructor(init: TextAreaFieldInit) {
    super(init);
    this.minChar = init.minChar;
    this.maxChar = init.maxChar;
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
    return <TextAreaFieldView element={this} ctx={ctx} />;
  }
}

function TextAreaFieldView({
  element,
  ctx,
}: {
  element: TextAreaField;
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
      <textarea
        id={element.id}
        name={element.id}
        placeholder={placeholder}
        value={value}
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
