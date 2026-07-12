import { useState } from 'react';

interface TextFieldProps {
  id?: string;
  name?: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  hint?: string;
  underField?: string | null;
  underFieldColor?: string;
  showHintBelowField?: boolean;
  required?: boolean;
  type?: 'text' | 'number' | 'date';
  maxLength?: number;
  readOnly?: boolean;
  inputClassName?: string;
  min?: string | number;
  step?: string | number;
}

export default function TextField({
  id,
  name,
  label,
  value,
  onChange,
  hint,
  underField = null,
  underFieldColor,
  showHintBelowField = true,
  required,
  type = 'text',
  maxLength,
  readOnly,
  inputClassName,
  min,
  step,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const stringValue = value === null || value === undefined ? '' : String(value);
  const empty = stringValue.trim() === '';

  const active = focused || !empty;
  const showHintBelow = underField === null && !!hint && showHintBelowField && active;
  const placeholder = empty && !focused ? hint : undefined;
  const showUnderField = underField !== null && underField !== '';
  const belowText = showUnderField ? underField : showHintBelow ? hint : null;
  const belowColor = showUnderField ? underFieldColor : undefined;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        required={required}
        maxLength={maxLength}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        min={min}
        step={step}
        className={inputClassName}
        placeholder={placeholder}
        value={stringValue}
        onMouseDown={(e) => {
          if (readOnly) {
            e.preventDefault();
            (document.activeElement as HTMLElement | null)?.blur();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
      />
      {belowText && (
        <div className="field-hint" style={belowColor ? { color: belowColor } : undefined}>
          {belowText}
        </div>
      )}
    </div>
  );
}
