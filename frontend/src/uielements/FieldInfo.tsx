import { useRef, useState, type ReactNode } from 'react';

interface FieldInfoProps {
  detail: string | null;
}

const POPOVER_MAX = 300;

export function FieldInfo({ detail }: FieldInfoProps): ReactNode {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [placeLeft, setPlaceLeft] = useState(false);

  if (!detail) return null;

  const evaluatePlacement = () => {
    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popW = Math.min(POPOVER_MAX, window.innerWidth * 0.8);
    const spaceRight = window.innerWidth - rect.right;
    setPlaceLeft(spaceRight < popW + 16);
  };

  return (
    <span className="field-info">
      <span
        ref={iconRef}
        className="field-info-icon"
        aria-label="Подробнее"
        tabIndex={0}
        onMouseEnter={evaluatePlacement}
        onFocus={evaluatePlacement}
      >
        i
      </span>
      <span
        className={`field-info-popover${placeLeft ? ' field-info-popover--left' : ''}`}
        role="tooltip"
      >
        {detail}
      </span>
    </span>
  );
}
