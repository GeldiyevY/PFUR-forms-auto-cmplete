import BudgetRow from '../components/BudgetRow';
import BudgetTotalRow from '../components/BudgetTotalRow';
import TeamMemberCard from '../components/TeamMember';
import { FieldInfo } from '../uielements/FieldInfo';
import type { BudgetKey } from '../hooks/useBudgetCalculations';
import type { BudgetLine, TeamMember as TeamMemberType } from '../types/form';

interface BudgetSectionProps {
  lines: Record<BudgetKey, BudgetLine>;
  totals: (BudgetLine & { total: number })[];
  year1Total: number;
  year2Total: number;
  year3Total: number;
  grandTotal: number;
  horizon: number;
  onBudgetChange: (key: BudgetKey, field: 'year1' | 'year2' | 'year3', value: number) => void;
  teamMembers: TeamMemberType[];
  teamTotalSalary: number;
  leadName: string;
  onTeamUpdate: (id: number, field: 'name' | 'salary', value: string | number) => void;
  onTeamRemove: (id: number) => void;
  onTeamAdd: () => void;
  detail?: string | null;
  minTeamSize?: number;
  maxTeamSize?: number;
}

const BUDGET_LABELS: { key: BudgetKey; label: string }[] = [
  { key: 'payroll', label: '1. Фонд оплаты труда (Итого)' },
  { key: 'equipment', label: '2. Оборудование (приобретение / модернизация)' },
  { key: 'materials', label: '3. Расходные материалы и комплектующие' },
  { key: 'travel', label: '4. Командировки' },
  { key: 'services', label: '5. Научно-технические услуги / работы сторонних организаций' },
  { key: 'other', label: '6. Прочие расходы, непосредственно связанные с выполняемым проектом' },
];

function buildTeamWarning(
  count: number,
  minTeamSize?: number,
  maxTeamSize?: number,
): string | null {
  if (minTeamSize != null && count < minTeamSize) {
    return `Рекомендуемый минимальный состав научного коллектива — не менее ${minTeamSize} чел. (сейчас: ${count}).`;
  }
  if (maxTeamSize != null && count > maxTeamSize) {
    return `Рекомендуемый максимальный состав научного коллектива — не более ${maxTeamSize} чел. (сейчас: ${count}).`;
  }
  return null;
}

export default function BudgetSection({
  lines,
  totals,
  year1Total,
  year2Total,
  year3Total,
  grandTotal,
  horizon,
  onBudgetChange,
  teamMembers,
  teamTotalSalary,
  onTeamUpdate,
  onTeamRemove,
  onTeamAdd,
  detail,
  minTeamSize,
  maxTeamSize,
}: BudgetSectionProps) {
  return (
    <>
      <div className="budget-table">
        <h3>
          Смета расходов по годам (тыс. руб.)
          <FieldInfo detail={detail ?? null} />
        </h3>

      {BUDGET_LABELS.map((item, i) => (
          <BudgetRow
            key={item.key}
            label={item.label}
            year1={lines[item.key].year1}
            year2={lines[item.key].year2}
            year3={lines[item.key].year3}
            total={totals[i].total}
            horizon={horizon}
            onChange={(field, value) => onBudgetChange(item.key, field, value)}
          />
        ))}

        <BudgetTotalRow
          year1={year1Total}
          year2={year2Total}
          year3={year3Total}
          grandTotal={grandTotal}
          horizon={horizon}
        />
      </div>

      <div className="team-budget">
        <h3>
          Расшифровка плановых затрат фонда оплаты труда членов научного коллектива на 1-й этап
        </h3>

        <div id="team-members">
          {teamMembers.map((member, idx) => (
            <div key={member.id}>
              <TeamMemberCard
                member={member}
                index={idx}
                isLead={idx === 0}
                onUpdate={onTeamUpdate}
                onRemove={onTeamRemove}
              />
              {maxTeamSize != null &&
                idx === maxTeamSize - 1 &&
                teamMembers.length > maxTeamSize && (
                  <p className="team-warning">
                    {buildTeamWarning(teamMembers.length, minTeamSize, maxTeamSize)}
                  </p>
                )}
            </div>
          ))}
        </div>

        <div className="team-controls">
          {minTeamSize != null && teamMembers.length < minTeamSize && (
            <p className="team-warning">
              {buildTeamWarning(teamMembers.length, minTeamSize, maxTeamSize)}
            </p>
          )}
          <button type="button" className="add-team-member-btn" onClick={onTeamAdd}>
            ➕ Добавить члена коллектива
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="f4_sum">
            <strong>Итого по этапу (тыс. руб.)</strong>
          </label>
          <input
            type="number"
            id="f4_sum"
            name="f4_sum"
            readOnly
            className="readonly-field total-field"
            value={teamTotalSalary.toFixed(1)}
          />
        </div>
      </div>
    </>
  );
}
