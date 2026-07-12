import { useState } from 'react';

interface TextAreaFieldProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  underField?: string | null;
  underFieldColor?: string;
  showHintBelowField?: boolean;
  required?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
}

export default function TextAreaField({
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
  maxLength,
  readOnly,
  className,
}: TextAreaFieldProps) {
  const [focused, setFocused] = useState(false);
  const empty = value.trim() === '';

  const active = focused || !empty;
  const showHintBelow = underField === null && !!hint && showHintBelowField && active;
  const placeholder = empty && !focused ? hint : undefined;
  const showUnderField = underField !== null && underField !== '';
  const belowText = showUnderField ? underField : showHintBelow ? hint : null;
  const belowColor = showUnderField ? underFieldColor : undefined;

  return (
    <div className={`form-group${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name ?? id}
        required={required}
        maxLength={maxLength}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        placeholder={placeholder}
        value={value}
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
