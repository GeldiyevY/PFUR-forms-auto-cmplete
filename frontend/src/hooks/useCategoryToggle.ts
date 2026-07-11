import { useState, useCallback } from 'react';

export function useCategoryToggle() {
  const [isCategoryA, setIsCategoryA] = useState(false);

  const handleCategoryChange = useCallback((value: string) => {
    setIsCategoryA(value === 'А');
  }, []);

  return { isCategoryA, handleCategoryChange };
}
