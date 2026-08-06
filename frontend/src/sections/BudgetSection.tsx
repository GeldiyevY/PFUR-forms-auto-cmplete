import BudgetRow from '../components/BudgetRow';
import BudgetTotalRow from '../components/BudgetTotalRow';
import TeamMemberCard from '../components/TeamMember';
import { FieldInfo } from '../uielements/FieldInfo';
import type { BudgetKey } from '../hooks/useBudgetCalculations';
import type { BudgetThresholdRule } from '../uielements/BudgetElement';
import {
  type RangeInfo,
  evaluateBudgetGroupThresholds,
} from '../utils/thresholds';
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
  budgetThresholds?: BudgetThresholdRule[];
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
  budgetThresholds,
}: BudgetSectionProps) {
  const groupViolations = evaluateBudgetGroupThresholds(
    budgetThresholds ?? [],
    lines,
    { 1: year1Total, 2: year2Total, 3: year3Total },
    horizon,
  );
  const totalWarnings: Partial<Record<1 | 2 | 3, string>> = {};
  for (const v of groupViolations) {
    totalWarnings[v.year] = (totalWarnings[v.year] ? totalWarnings[v.year] + " " : "") + v.message;
  }

  return (
    <>
      <div className="budget-table">
        <h3>
          Смета расходов по годам (тыс. руб.)
          <FieldInfo detail={detail ?? null} />
        </h3>

      {BUDGET_LABELS.map((item, i) => {
        const tr = (budgetThresholds ?? []).filter((t) => t.line === item.key);
        const yearTotals: Record<1 | 2 | 3, number> = { 1: year1Total, 2: year2Total, 3: year3Total };
        const rangeFor = (year: 1 | 2 | 3): RangeInfo | undefined => {
          const matches = tr.filter((t) => {
            const y = t.year ?? "all";
            return y === "all" || y === year;
          });
          if (matches.length === 0) return undefined;
          const merged: RangeInfo = {};
          let minPercent: number | undefined;
          for (const m of matches) {
            if (m.min != null) merged.min = Math.max(merged.min ?? -Infinity, m.min);
            if (m.max != null) merged.max = Math.min(merged.max ?? Infinity, m.max);
            if (m.message) merged.message = m.message;
            if (m.maxPercent != null) minPercent = Math.min(minPercent ?? Infinity, m.maxPercent);
          }
          if (minPercent != null) {
            merged.percentMax = { percent: minPercent, maxValue: minPercent * yearTotals[year] };
          }
          return merged;
        };
        const thresholds: Partial<Record<'year1' | 'year2' | 'year3', RangeInfo>> = {
          year1: rangeFor(1),
          year2: rangeFor(2),
          year3: rangeFor(3),
        };
        return (
          <BudgetRow
            key={item.key}
            label={item.label}
            year1={lines[item.key].year1}
            year2={lines[item.key].year2}
            year3={lines[item.key].year3}
            total={totals[i].total}
            horizon={horizon}
            onChange={(field, value) => onBudgetChange(item.key, field, value)}
            thresholds={thresholds}
          />
        );
      })}

        <BudgetTotalRow
          year1={year1Total}
          year2={year2Total}
          year3={year3Total}
          grandTotal={grandTotal}
          horizon={horizon}
          warnings={totalWarnings}
        />
      </div>

      {groupViolations.length > 0 && (
        <div className="budget-group-warnings">
          <h4>Замечания по структуре сметы расходов</h4>
          <ul>
            {groupViolations.map((v, i) => (
              <li key={i}>{v.message}</li>
            ))}
          </ul>
        </div>
      )}

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
