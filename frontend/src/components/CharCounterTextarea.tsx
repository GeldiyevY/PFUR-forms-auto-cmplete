import { useCharCounter } from '../hooks/useCharCounter';

interface CharCounterTextareaProps {
  id: string;
  label: string;
  maxLength: number;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function CharCounterTextarea({
  id,
  label,
  maxLength,
  placeholder,
  value,
  onChange,
  required,
}: CharCounterTextareaProps) {
  const { count, color } = useCharCounter(maxLength);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={id}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={handleInput}
      />
      <div className="char-counter">
        <span style={{ color }}>{count}</span>/{maxLength} символов
      </div>
    </div>
  );
}
