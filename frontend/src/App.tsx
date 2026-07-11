import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatusAlert from './components/StatusAlert';
import ButtonContainer from './components/ButtonContainer';
import ProjectGeneralInfo from './sections/ProjectGeneralInfo';
import ProjectDescription from './sections/ProjectDescription';
import RudnDepartment from './sections/RudnDepartment';
import KpiSection from './sections/KpiSection';
import BudgetSection from './sections/BudgetSection';
import ExpenseBreakdown from './sections/ExpenseBreakdown';
import PersonalData from './sections/PersonalData';
import OrganizationInfo from './sections/OrganizationInfo';
import { useTemplate } from './hooks/useTemplate';
import { useCategoryToggle } from './hooks/useCategoryToggle';
import { useBudgetCalculations } from './hooks/useBudgetCalculations';
import { useTeamMembers } from './hooks/useTeamMembers';
import { useExpenseItems } from './hooks/useExpenseItems';
import { useDocumentGenerator } from './hooks/useDocumentGenerator';
import type {
  FormData,
  KpiData,
  KpiStageData,
  AlertType,
} from './types/form';
import './App.css';

function createDefaultFormData(): FormData {
  return {
    project_name: '',
    key_words: '',
    sience_field: '',
    research_direction: '',
    project_category: '',
    project_annotation: '',
    project_objective: '',
    project_goal: '',
    project_tasks: '',
    research_description: '',
    scientific_methods_description: '',
    project_background_description: '',
    expected_results: '',
    content_of_work: '',
    equipment: '',
    name_of_np: '',
    full_name_of_np: '',
    head_of_project: '',
    head_of_np: '',
    head_of_project_qualifications: '',
    date: '',
    organization_name: '',
    organization_info: '',
    head_of_organization: '',
    main_accountant_of_organization: '',
    position: '',
  };
}

function createDefaultKpiData(): KpiData {
  const kpe = (): KpiStageData => ({ stage1: 0, stage2: 0, stage3: 0, comment: '' });
  return {
    kpe1: kpe(),
    kpe2: kpe(),
    kpe3: kpe(),
    kpe4: kpe(),
    kpe5: kpe(),
    kpe6: kpe(),
    kpe7: kpe(),
  };
}

const REQUIRED_FIELDS: (keyof FormData)[] = [
  'project_name',
  'key_words',
  'sience_field',
  'research_direction',
  'project_category',
  'project_annotation',
  'name_of_np',
  'head_of_project',
  'head_of_np',
  'date',
];

const FIELD_LABELS: Record<string, string> = {
  project_name: 'Название проекта',
  key_words: 'Ключевые слова',
  sience_field: 'Область науки',
  research_direction: 'Направление исследования',
  project_category: 'Категория проекта',
  project_annotation: 'Аннотация проекта',
  name_of_np: 'Название подразделения РУДН',
  head_of_project: 'Руководитель проекта',
  head_of_np: 'Руководитель ОУП / НП',
  date: 'Дата',
};

export default function App() {
  const { buffer: templateBuffer, loading: templateLoading, error: templateError, loadTemplate } = useTemplate();
  const { isCategoryA, handleCategoryChange } = useCategoryToggle();
  const { lines, totals, year1Total, year2Total, year3Total, grandTotal, updateLine } =
    useBudgetCalculations(isCategoryA);

  const [formData, setFormData] = useState<FormData>(createDefaultFormData);
  const [kpiData, setKpiData] = useState<KpiData>(createDefaultKpiData);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    members: teamMembers,
    totalSalary: teamTotalSalary,
    addMember: addTeamMember,
    removeMember: removeTeamMember,
    updateMember: updateTeamMember,
    syncLeadName,
  } = useTeamMembers(formData.head_of_project);

  const {
    items: expenseItems,
    totals: expenseTotals,
    addItem: addExpenseItem,
    removeItem: removeExpenseItem,
    updateItem: updateExpenseItem,
  } = useExpenseItems();

  const { generate } = useDocumentGenerator();

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  useEffect(() => {
    if (templateError) {
      setAlert({ type: 'error', message: templateError });
    }
  }, [templateError]);

  const updateFormField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'head_of_project') {
        syncLeadName(value);
      }
      return next;
    });
  }, [syncLeadName]);

  const handleCategoryChangeWrapper = useCallback(
    (value: string) => {
      handleCategoryChange(value);
      setFormData((prev) => ({ ...prev, project_category: value as FormData['project_category'] }));
      if (value !== 'А') {
        setKpiData((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next) as (keyof KpiData)[]) {
            next[key] = { ...next[key], stage3: 0 };
          }
          return next;
        });
      }
    },
    [handleCategoryChange],
  );

  const updateKpiField = useCallback(
    (kpeIndex: string, field: string, value: string | number) => {
      setKpiData((prev) => ({
        ...prev,
        [kpeIndex]: { ...prev[kpeIndex as keyof KpiData], [field]: value },
      }));
    },
    [],
  );

  const validateForm = useCallback((): boolean => {
    const missing: string[] = [];
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field].trim()) {
        missing.push(FIELD_LABELS[field] || field);
      }
    }
    if (missing.length > 0) {
      setAlert({ type: 'error', message: `Пожалуйста, заполните обязательные поля: ${missing.join(', ')}` });
      return false;
    }
    return true;
  }, [formData]);

  const handleGenerate = useCallback(async () => {
    if (!templateBuffer) {
      setAlert({ type: 'error', message: 'Шаблон не загружен. Перезагрузите страницу.' });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setAlert({ type: 'error', message: '' });

    try {
      await generate({
        templateBuffer,
        formData: { ...formData, project_category: isCategoryA ? 'А' : 'Б' },
        teamMembers,
        expenseItems,
        budgetYear1Total: year1Total,
        budgetYear2Total: year2Total,
        budgetYear3Total: year3Total,
        budgetGrandTotal: grandTotal,
        teamTotalSalary,
        isCategoryA,
      });
      setAlert({ type: 'success', message: `Документ "Заявка ${formData.project_name}.docx" успешно создан и скачан!` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка создания документа';
      setAlert({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [templateBuffer, formData, isCategoryA, teamMembers, expenseItems, year1Total, year2Total, year3Total, grandTotal, teamTotalSalary, generate, validateForm]);

  const fillTestData = useCallback(() => {
    const d = new Date();
    const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    setFormData({
      project_name: 'Разработка инновационной системы искусственного интеллекта для медицинской диагностики',
      key_words: 'искусственный интеллект, медицинская диагностика, машинное обучение, нейронные сети, цифровая медицина',
      sience_field: 'ГРНТИ 28.23.37 - Искусственный интеллект; ОЭСР 1.02 - Информатика; Приоритетное направление СНТР - Информационно-телекоммуникационные системы',
      research_direction: 'Прикладное',
      project_category: 'А',
      project_annotation: 'Проект направлен на создание интеллектуальной системы медицинской диагностики на основе глубокого машинного обучения. Система будет анализировать медицинские изображения и данные для повышения точности диагностики онкологических заболеваний.',
      project_objective: 'Медицинские изображения (рентген, МРТ, КТ) и клинические данные пациентов',
      project_goal: 'Создание высокоточной системы автоматической диагностики онкологических заболеваний с использованием технологий искусственного интеллекта.',
      project_tasks: '1. Разработка алгоритмов глубокого обучения; 2. Создание базы данных медицинских изображений; 3. Обучение нейронных сетей; 4. Валидация системы в клинических условиях.',
      research_description: 'Актуальность исследования обусловлена растущей потребностью в точной и быстрой медицинской диагностике. Современные методы машинного обучения показывают высокую эффективность в анализе медицинских изображений. Проект адекватен мировому уровню науки, использует передовые архитектуры нейронных сетей.',
      scientific_methods_description: 'Исследование базируется на методах глубокого обучения и компьютерного зрения. Будут применены сверточные нейронные сети, трансформеры, аугментация данных, transfer learning, ансамблевые методы и статистическая валидация.',
      project_background_description: 'Научный коллектив имеет опыт работы с технологиями машинного обучения и медицинскими данными. Предыдущие работы включают исследования в области компьютерного зрения (публикации в IEEE, Scopus).',
      expected_results: '1-й этап: Разработка базовых алгоритмов, прототип системы, публикации. 2-й этап: Обучение моделей, точность >95%, патент, конференции. 3-й этап: Клиническая валидация, готовый продукт, коммерциализация.',
      content_of_work: '1-й год: Сбор данных, разработка алгоритмов, закупка оборудования. 2-й год: Обучение моделей, тестирование, публикации. 3-й год: Клинические испытания, доработка системы, коммерциализация.',
      equipment: 'GPU-сервер NVIDIA A100, рабочие станции, медицинский сканер, ПО.',
      name_of_np: 'Институт математики и информатики',
      full_name_of_np: 'Петров Петр Петрович',
      head_of_project: 'Иванов Иван Иванович',
      head_of_np: 'Петров Петр Петрович',
      head_of_project_qualifications: 'Иванов Иван Иванович, профессор, д.т.н. 50+ публикаций, 3 патента, руководство 15 НИР/НИОКР.',
      date: dateStr,
      organization_name: 'Российский университет дружбы народов имени Патриса Лумумбы',
      organization_info: 'ИНН: 7729086366, ОГРН: 1027739661538, КПП: 772901001. Адрес: 117198, г. Москва, ул. Миклухо-Маклая, д. 6.',
      head_of_organization: 'Филиппов Владимир Михайлович',
      main_accountant_of_organization: 'Сидорова Анна Владимировна',
      position: 'Ректор университета',
    });

    handleCategoryChange('А');

    setKpiData({
      kpe1: { stage1: 2, stage2: 3, stage3: 2, comment: 'Публикации в IEEE' },
      kpe2: { stage1: 500, stage2: 750, stage3: 1000, comment: 'Гранты РНФ' },
      kpe3: { stage1: 2, stage2: 3, stage3: 2, comment: 'ICML, NeurIPS' },
      kpe4: { stage1: 1, stage2: 1, stage3: 1, comment: 'Патентование алгоритмов' },
      kpe5: { stage1: 0, stage2: 1, stage3: 2, comment: 'Патенты на методы' },
      kpe6: { stage1: 0, stage2: 0, stage3: 1, comment: 'Коммерциализация' },
      kpe7: { stage1: 3, stage2: 4, stage3: 5, comment: 'Студенты и аспиранты' },
    });

    window.setTimeout(() => {
      updateLine('payroll', 'year1', 800);
      updateLine('payroll', 'year2', 850);
      updateLine('payroll', 'year3', 900);
      updateLine('equipment', 'year1', 2500);
      updateLine('equipment', 'year2', 1500);
      updateLine('equipment', 'year3', 500);
      updateLine('materials', 'year1', 150);
      updateLine('materials', 'year2', 200);
      updateLine('materials', 'year3', 100);
      updateLine('travel', 'year1', 200);
      updateLine('travel', 'year2', 250);
      updateLine('travel', 'year3', 300);
      updateLine('services', 'year1', 300);
      updateLine('services', 'year2', 200);
      updateLine('services', 'year3', 150);
      updateLine('other', 'year1', 100);
      updateLine('other', 'year2', 75);
      updateLine('other', 'year3', 50);
    }, 50);

    window.setTimeout(() => {
      const team1 = document.querySelector<HTMLInputElement>('input[name="salary_1"]');
      if (team1) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        nativeInputValueSetter?.call(team1, 450);
        team1.dispatchEvent(new Event('input', { bubbles: true }));
      }
      updateTeamMember(1, 'salary', 450);

      addTeamMember();
    }, 100);

    window.setTimeout(() => {
      updateTeamMember(2, 'name', 'Сидоров Сидор Сидорович, ведущий научный сотрудник, 0.5 ставки');
      updateTeamMember(2, 'salary', 200);
      addTeamMember();
    }, 200);

    window.setTimeout(() => {
      updateTeamMember(3, 'name', 'Александров Александр Александрович, аспирант, 0.25 ставки');
      updateTeamMember(3, 'salary', 100);
      addTeamMember();
    }, 300);

    window.setTimeout(() => {
      updateTeamMember(4, 'name', 'Николаева Наталья Николаевна, студент магистратуры, 0.1 ставки');
      updateTeamMember(4, 'salary', 50);
    }, 400);

    const eqData = [
      { name: 'GPU-сервер NVIDIA A100 80GB', quantity: 1, price: 2000 },
      { name: 'Рабочие станции для разработки', quantity: 2, price: 400 },
      { name: 'SSD накопители 2TB', quantity: 4, price: 50 },
    ];

    eqData.forEach((_item, i) => {
      if (i > 0) addExpenseItem('equipment');
    });
    window.setTimeout(() => {
      document.querySelectorAll<HTMLInputElement>('[data-category="equipment"] input[name$="_name"]').forEach((el, i) => {
        if (eqData[i]) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          )?.set;
          nativeInputValueSetter?.call(el, eqData[i].name);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }, 500);

    // We can't easily set values on dynamically created inputs via React state
    // because addTeamMember/addExpenseItem increments internal counters.
    // Instead we use timeouts to batch-set after the DOM is ready.
  }, [updateLine, updateTeamMember, addTeamMember, addExpenseItem, handleCategoryChange]);

  useEffect(() => {
    if (formData.head_of_project) {
      syncLeadName(formData.head_of_project);
    }
  }, [formData.head_of_project, syncLeadName]);

  return (
    <>
      <div className="container">
        <Header />

        <div className="form-container">
          <div className="status-messages">
            {templateLoading && (
              <div className="alert alert-info loading" style={{ display: 'flex' }}>
                <div className="spinner" />
                <div id="loading-text">Загружается шаблон...</div>
              </div>
            )}
            {alert && <StatusAlert type={alert.type} message={alert.message} />}
          </div>

          <form id="document-form">
            <ProjectGeneralInfo
              data={formData}
              onChange={updateFormField}
              onCategoryChange={handleCategoryChangeWrapper}
            />

            <ProjectDescription data={formData} onChange={updateFormField} />

            <RudnDepartment data={formData} onChange={updateFormField} />

            <KpiSection
              data={kpiData}
              isCategoryA={isCategoryA}
              onChange={updateKpiField}
            />

            <BudgetSection
              lines={lines}
              totals={totals}
              year1Total={year1Total}
              year2Total={year2Total}
              year3Total={year3Total}
              grandTotal={grandTotal}
              isCategoryA={isCategoryA}
              onBudgetChange={updateLine}
              teamMembers={teamMembers}
              teamTotalSalary={teamTotalSalary}
              leadName={formData.head_of_project}
              onTeamUpdate={updateTeamMember}
              onTeamRemove={removeTeamMember}
              onTeamAdd={addTeamMember}
            />

            <ExpenseBreakdown
              items={expenseItems}
              totals={expenseTotals}
              onAddItem={addExpenseItem}
              onUpdateItem={updateExpenseItem}
              onRemoveItem={removeExpenseItem}
            />

            <PersonalData data={formData} onChange={updateFormField} />

            <OrganizationInfo data={formData} onChange={updateFormField} />

            <ButtonContainer
              onTestFill={fillTestData}
              onGenerate={handleGenerate}
              disabled={isLoading || templateLoading}
            />
          </form>
        </div>
      </div>
    </>
  );
}
