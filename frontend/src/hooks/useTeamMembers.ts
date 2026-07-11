import { useState, useCallback, useMemo } from 'react';
import type { TeamMember } from '../types/form';

let nextId = 2;

export function useTeamMembers(leadName: string) {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: leadName || 'Руководитель проекта', salary: 0 },
  ]);

  const addMember = useCallback(() => {
    const id = nextId++;
    setMembers((prev) => [...prev, { id, name: '', salary: 0 }]);
  }, []);

  const removeMember = useCallback((id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMember = useCallback(
    (id: number, field: 'name' | 'salary', value: string | number) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      );
    },
    [],
  );

  const syncLeadName = useCallback(
    (name: string) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === 1 ? { ...m, name: name || 'Руководитель проекта' } : m)),
      );
    },
    [],
  );

  const totalSalary = useMemo(
    () => members.reduce((sum, m) => sum + (m.salary || 0), 0),
    [members],
  );

  return {
    members,
    totalSalary,
    addMember,
    removeMember,
    updateMember,
    syncLeadName,
  };
}
