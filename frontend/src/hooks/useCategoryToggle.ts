import { useState, useCallback } from 'react';
import type { GrantCategory } from '../types/grantTypes';
import { fromDisplayCategory } from '../types/grantTypes';

export function useCategoryToggle() {
  const [category, setCategory] = useState<GrantCategory>('A');

  const handleCategoryChange = useCallback((value: string) => {
    const parsed = fromDisplayCategory(value);
    if (parsed) {
      setCategory(parsed);
    }
  }, []);

  return { category, isCategoryA: category === 'A', handleCategoryChange };
}
