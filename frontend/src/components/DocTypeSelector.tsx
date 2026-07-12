import type { GrantTypeId } from '../types/grantTypes';
import { GRANT_TYPE_OPTIONS } from '../types/grantTypes';

interface DocTypeSelectorProps {
  selected: GrantTypeId;
  onChange: (id: GrantTypeId) => void;
}

export default function DocTypeSelector({ selected, onChange }: DocTypeSelectorProps) {
  return (
    <div className="doc-type-selector">
      {GRANT_TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`doc-type-chip${selected === opt.id ? ' active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
