import { useState, useCallback } from 'react';

export function useCharCounter(maxLength: number) {
  const [count, setCount] = useState(0);

  const handleChange = useCallback(
    (value: string) => {
      setCount(value.length);
    },
    [],
  );

  const color =
    count > maxLength * 0.9 ? '#e74c3c' : count > maxLength * 0.75 ? '#f39c12' : '#666';

  return { count, color, handleChange };
}
