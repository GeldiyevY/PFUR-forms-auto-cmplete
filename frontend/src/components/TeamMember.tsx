import type { TeamMember as TeamMemberType } from '../types/form';

interface TeamMemberProps {
  member: TeamMemberType;
  index: number;
  isLead: boolean;
  onUpdate: (id: number, field: 'name' | 'salary', value: string | number) => void;
  onRemove: (id: number) => void;
}

export default function TeamMemberCard({
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
        <div className="form-group">
          <label htmlFor="">ФИО, должность в научном коллективе, доля ставки</label>
          <input
            type="text"
            placeholder={
              isLead
                ? 'Руководитель проекта (автоматически)'
                : 'Фамилия И.О., должность, доля ставки'
            }
            value={isLead ? '' : member.name}
            readOnly={isLead}
            className={isLead ? 'readonly-field' : ''}
            onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Годовой ФОТ (тыс. руб.)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={member.salary || ''}
            onChange={(e) =>
              onUpdate(member.id, 'salary', e.target.value === '' ? 0 : parseFloat(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
}
