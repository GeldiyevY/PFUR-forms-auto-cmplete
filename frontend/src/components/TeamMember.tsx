import { memo } from 'react';
import TextField from './TextField';
import type { TeamMember as TeamMemberType } from '../types/form';

interface TeamMemberProps {
  member: TeamMemberType;
  index: number;
  isLead: boolean;
  onUpdate: (id: number, field: 'name' | 'salary', value: string | number) => void;
  onRemove: (id: number) => void;
}

function TeamMemberCard({
  member,
  isLead,
  onUpdate,
  onRemove,
}: TeamMemberProps) {
  return (
    <div className="team-member">
      {!isLead && (
        <button
          type="button"
          className="remove-team-member"
          onClick={() => onRemove(member.id)}
          title="Удалить члена коллектива"
        >
          ✕
        </button>
      )}
      <div className="two-column">
        <TextField
          label="ФИО, должность в научном коллективе, доля ставки"
          value={member.name}
          hint={
            isLead
              ? 'Руководитель проекта (автоматически)'
              : 'Фамилия И.О., должность, доля ставки'
          }
          readOnly={isLead}
          inputClassName={isLead ? 'readonly-field' : ''}
          onChange={(v) => onUpdate(member.id, 'name', v)}
        />
        <TextField
          label="Годовой ФОТ (тыс. руб.)"
          type="number"
          min="0"
          step="0.1"
          hint="0.0"
          showHintBelowField={false}
          value={member.salary || ''}
          onChange={(v) =>
            onUpdate(member.id, 'salary', v === '' ? 0 : parseFloat(v))
          }
        />
      </div>
    </div>
  );
}

export default memo(TeamMemberCard);
