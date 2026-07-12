import type { FormData } from './form';

export type GrantTypeId = 'R.1' | 'D.1' | 'D.2';
export type GrantCategory = 'A' | 'B';

export interface AgeLimit {
  withDegree: number | null;
  withoutDegree: number | null;
}

export interface CategoryConfig {
  value: GrantCategory;
  label: string;
  workPlanHorizon: number;
  ageLimit: AgeLimit | null;
  brsThreshold: number;
}

export interface SectionFlags {
  kpi: boolean;
  budget: boolean;
  expenseBreakdown: boolean;
  teamMembers: boolean;
  organizationInfo: boolean;
  rudnDepartment: boolean;
}

export interface GrantTypeConfig {
  id: GrantTypeId;
  label: string;
  description?: string;
  sections: SectionFlags;
  teamSize?: { min: number; max: number | null };
  requiresDegree?: boolean;
  categories: CategoryConfig[];
  requiredFields: Partial<Record<GrantCategory, (keyof FormData)[]>>;
  notes?: string;
}

const A_DISPLAY = 'А' as const;
const B_DISPLAY = 'Б' as const;

export function toDisplayCategory(cat: GrantCategory): 'А' | 'Б' {
  return cat === 'A' ? A_DISPLAY : B_DISPLAY;
}

export function fromDisplayCategory(cat: string): GrantCategory | null {
  if (cat === A_DISPLAY) return 'A';
  if (cat === B_DISPLAY) return 'B';
  return null;
}

export class GrantType {
  readonly config: GrantTypeConfig;

  constructor(config: GrantTypeConfig) {
    this.config = config;
  }

  get id(): GrantTypeId { return this.config.id; }
  get label(): string { return this.config.label; }
  get description(): string { return this.config.description || ''; }
  get categoryConfigs(): CategoryConfig[] { return this.config.categories; }
  get teamSize() { return this.config.teamSize; }
  get requiresDegree(): boolean { return this.config.requiresDegree || false; }

  get hasKpi(): boolean { return this.config.sections.kpi; }
  get hasBudget(): boolean { return this.config.sections.budget; }
  get hasExpenseBreakdown(): boolean { return this.config.sections.expenseBreakdown; }
  get hasTeamMembers(): boolean { return this.config.sections.teamMembers; }
  get hasOrganizationInfo(): boolean { return this.config.sections.organizationInfo; }
  get hasRudnDepartment(): boolean { return this.config.sections.rudnDepartment; }

  getCategoryConfig(category: GrantCategory): CategoryConfig {
    const found = this.config.categories.find((c) => c.value === category);
    if (!found) throw new Error(`Category ${category} not available for ${this.id}`);
    return found;
  }

  getRequiredFields(category: GrantCategory): (keyof FormData)[] {
    return this.config.requiredFields[category] || [];
  }
}

const REQUIRED_FIELDS_A_B: (keyof FormData)[] = [
  'project_name', 'key_words', 'science_field', 'research_direction',
  'project_category', 'project_annotation', 'name_of_np',
  'head_of_project', 'head_of_np', 'date',
];

const R1_CONFIG: GrantTypeConfig = {
  id: 'R.1',
  label: 'НИР/НИОКР молодыми учёными (мероприятие R)',
  description: 'Заявка на грант для молодых учёных',
  sections: {
    kpi: true,
    budget: true,
    expenseBreakdown: true,
    teamMembers: true,
    organizationInfo: true,
    rudnDepartment: true,
  },
  teamSize: { min: 1, max: null },
  requiresDegree: false,
  categories: [
    {
      value: 'A',
      label: 'А',
      workPlanHorizon: 3,
      ageLimit: { withDegree: 39, withoutDegree: 35 },
      brsThreshold: 55,
    },
    {
      value: 'B',
      label: 'Б',
      workPlanHorizon: 2,
      ageLimit: { withDegree: 39, withoutDegree: 35 },
      brsThreshold: 35,
    },
  ],
  requiredFields: { A: REQUIRED_FIELDS_A_B, B: REQUIRED_FIELDS_A_B },
  notes: 'Категория А: возраст на 31.12.2028. Категория Б: возраст на 31.12.2027. Публикации: ест.науки ≥3, гум/соц ≥2. Финансирование: ест. ≥700 тыс., гум/соц ≥300 тыс. 3-й этап (КПЭ+смета) только для А. Смета: НТУ ≤10%. Ф2+3+4 ≤16 стр.',
};

const D1_CONFIG: GrantTypeConfig = {
  id: 'D.1',
  label: 'НИР/НИОКР коллективами под руководством молодых учёных (мероприятие D)',
  description: 'Заявка на грант для научных коллективов под руководством молодого учёного',
  sections: {
    kpi: true,
    budget: true,
    expenseBreakdown: true,
    teamMembers: true,
    organizationInfo: true,
    rudnDepartment: true,
  },
  teamSize: { min: 4, max: 7 },
  requiresDegree: true,
  categories: [
    {
      value: 'A',
      label: 'А',
      workPlanHorizon: 3,
      ageLimit: { withDegree: 39, withoutDegree: null },
      brsThreshold: 100,
    },
    {
      value: 'B',
      label: 'Б',
      workPlanHorizon: 2,
      ageLimit: { withDegree: 39, withoutDegree: null },
      brsThreshold: 80,
    },
  ],
  requiredFields: { A: REQUIRED_FIELDS_A_B, B: REQUIRED_FIELDS_A_B },
  notes: 'Категория А: возраст на 31.12.2028. Категория Б: возраст на 31.12.2027. Руководитель ≤39 лет, уч. степень обязательна; если старше 39 — письменное обоснование. Публикации рук.: ест. ≥4, гум/соц ≥2; рук./уч. в НИР/НИОКР ≥1; зарег. РИД (прикл.) ≥1; опыт ≥3. Коллектив 4–7 чел.: ≥70% до 39 лет, ≥40% студ/асп (очная РУДН), ≥1 н.с. из сторонней орг. (≥0.5 ст.). Требования к членам: публ. W/S ≥2 (1 с рук.), опыт НИР/НИОКР ≥1, зарег. РИД (прикл.) ≥2. Финансирование: ест. ≥1000 тыс., гум/соц ≥500 тыс. Смета: закупки/командировки/НТУ ≥30% (ест)/≥15% (гс); ФОТ ≤70% (ест)/≤85% (гс); НТУ ≤10%. 3-й этап только для А. Ф2+3+4 ≤16 стр.',
};

const D2_CONFIG: GrantTypeConfig = {
  id: 'D.2',
  label: 'НИР/НИОКР коллективами под руководством ведущих учёных (мероприятие D)',
  description: 'Заявка на грант для научных коллективов под руководством ведущего учёного',
  sections: {
    kpi: true,
    budget: true,
    expenseBreakdown: true,
    teamMembers: true,
    organizationInfo: true,
    rudnDepartment: true,
  },
  teamSize: { min: 4, max: 7 },
  requiresDegree: true,
  categories: [
    {
      value: 'A',
      label: 'А',
      workPlanHorizon: 3,
      ageLimit: null,
      brsThreshold: 155,
    },
    {
      value: 'B',
      label: 'Б',
      workPlanHorizon: 2,
      ageLimit: null,
      brsThreshold: 125,
    },
  ],
  requiredFields: { A: REQUIRED_FIELDS_A_B, B: REQUIRED_FIELDS_A_B },
  notes: 'Категория А: срок 3 года. Категория Б: срок 2 года. Возраст руководителя НЕ ограничен; обязательна уч. степень к.н./д.н. Публикации рук.: ест. ≥5 (Q1/Q2), гум/соц ≥3 (Q1/Q2); рук./уч. в НИР/НИОКР (1 рук. + 1 уч.); зарег. РИД (прикл.) ≥2; опыт ≥3. Коллектив 4–7 чел.: ≥50% до 39 лет, ≥30% студ/асп (очная РУДН), ≥1 н.с. из сторонней орг. (≥0.5 ст.). Требования к членам: публ. W/S ест. 5 (3 с рук.) / гс. 2 (1 с рук.), опыт НИР/НИОКР ест.≥2 / гс.≥1, зарег. РИД (прикл.) ≥2. Финансирование: ест. ≥1500 тыс., гум/соц ≥700 тыс. Смета: закупки/командировки/НТУ ≥30% (ест)/≥15% (гс); ФОТ ≤70% (ест)/≤85% (гс); НТУ ≤10%. 3-й этап только для А. Ф2+3+4 ≤16 стр.',
};

const REGISTRY: Record<string, GrantTypeConfig> = {
  'R.1': R1_CONFIG,
  'D.1': D1_CONFIG,
  'D.2': D2_CONFIG,
};

export function createGrantType(id: GrantTypeId): GrantType {
  const config = REGISTRY[id];
  if (!config) throw new Error(`Unknown grant type: ${id}`);
  return new GrantType(config);
}

export const GRANT_TYPE_OPTIONS: { id: GrantTypeId; label: string }[] = [
  { id: 'R.1', label: 'R.1' },
  { id: 'D.1', label: 'D.1' },
  { id: 'D.2', label: 'D.2' },
];
