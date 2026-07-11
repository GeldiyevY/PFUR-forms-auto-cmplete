export interface FormData {
  project_name: string;
  key_words: string;
  sience_field: string;
  research_direction: string;
  project_category: 'А' | 'Б' | '';
  project_annotation: string;
  project_objective: string;
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
  head_of_project_qualifications: string;
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

export interface KpiData {
  kpe1: KpiStageData;
  kpe2: KpiStageData;
  kpe3: KpiStageData;
  kpe4: KpiStageData;
  kpe5: KpiStageData;
  kpe6: KpiStageData;
  kpe7: KpiStageData;
}

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

export type ExpenseCategoryType = 'equipment' | 'travel' | 'services' | 'other';

export type AlertType = 'success' | 'error';

export interface TemplateState {
  buffer: Uint8Array | null;
  loading: boolean;
  error: string | null;
}
