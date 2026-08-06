export interface FormData {
  project_name: string;
  key_words: string;
  science_field: string;
  research_direction: string;
  project_category: "А" | "Б" | "";
  project_annotation: string;
  project_goal: string;
  project_tasks: string;
  research_description: string;
  scientific_methods_description: string;
  project_background_description: string;
  expected_results: string;
  content_of_work: string;
  equipment: string;
  name_of_np: string;
  full_name_of_np: string;
  head_of_project: string;
  head_of_np: string;
  head_of_project_qualification: string;
  date: string;
  organization_name: string;
  organization_info: string;
  head_of_organization: string;
  main_accountant_of_organization: string;
  position: string;
}

export interface KpiStageData {
  stage1: number;
  stage2: number;
  stage3: number;
  comment: string;
}

/** A single line inside a criteria-based КПЭ (КПЭ-1/3/5). */
export interface KpiSubRow {
  stage1: number;
  stage2: number;
  stage3: number;
  /** Key into the GrantType's criteria dict ('' = none chosen). */
  criteria: string;
}

/** Criteria-based КПЭ (КПЭ-1/3/5): several sub-rows + one shared comment. */
export interface KpiCriteriaRow {
  rows: KpiSubRow[];
  comment: string;
}

export interface KpiData {
  kpe1: KpiCriteriaRow;
  kpe2: KpiStageData;
  kpe3: KpiCriteriaRow;
  kpe4: KpiStageData;
  kpe5: KpiCriteriaRow;
  kpe6: KpiStageData;
  /** Студенты и/или аспиранты в составе научного коллектива (R1 = row 7, D1 = row 10). */
  kpe7: KpiStageData;
  /** D1 only: 8. Состав научного коллектива. */
  kpe8: KpiStageData;
  /** D1 only: 9. Исследователи в возрасте … */
  kpe9: KpiStageData;
}

/** Criteria dict: criteria name -> point multiplier. */
export type KpiCriteria = Record<string, number>;

export interface BudgetLine {
  year1: number;
  year2: number;
  year3: number;
}

export interface TeamMember {
  id: number;
  name: string;
  salary: number;
}

export interface ExpenseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export type ExpenseCategoryType = "equipment" | "travel" | "services" | "other";

export type AlertType = "success" | "error";

export interface TemplateState {
  buffer: Uint8Array | null;
  loading: boolean;
  error: string | null;
}
