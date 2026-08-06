import { GrantType } from "./GrantType";
import { TextField } from "../uielements/TextField";
import { NumberField } from "../uielements/NumberField";
import type { DrawContext } from "../uielements/UIElement";
import { TextAreaField } from "../uielements/TextAreaField";
import { SelectField } from "../uielements/SelectField";
import { CategorySelector } from "../uielements/CategorySelector";
import { ScienceFieldSelect } from "../uielements/ScienceFieldSelect";
import { DateField } from "../uielements/DateField";
import { ScienceFieldApplied } from "../science_field/ScienceFieldApplied";
import { ScienceFieldFundamental } from "../science_field/ScienceFieldFundamental";
import { KpiElement } from "../uielements/KpiElement";
import { BudgetElement } from "../uielements/BudgetElement";
import { Row } from "../uielements/Row";
import {
  RowElementTextField,
  RowElementNumberField,
} from "../uielements/RowElement";
import { CategoryA } from "../categories/CategoryA";
import { CategoryB } from "../categories/CategoryB";
import { DirectionNaturalScience } from "../direction/DirectionNaturalScience";
import { DirectionSocialScience } from "../direction/DirectionSocialScience";
// Мин. число публикаций руководителя, п.3.3.1 КД D.2 (Приказ №1327-р).
// ВНИМАНИЕ: по КД это публикации ТОЛЬКО Q1/Q2 (WoS/Scopus). Квартиль в анкете
// не запрашивается, поэтому проверяется сумма WoS + Scopus как нижняя оценка.
// Ключ 1 — область наук; ключ 2 — направление исследования.
const pubMinByDirSf: Record<string, Record<string, number>> = {
  Естественнонаучное: { Фундаментальное: 5, Прикладное: 5 },
  "Социально-гуманитарное": { Фундаментальное: 4, Прикладное: 3 },
};
function pubVerification(value: string, otherId: string, reg: DrawContext) {
  const v = parseInt(value, 10);
  const otherV = parseInt(reg.values[otherId] ?? "", 10);
  if (isNaN(v) && isNaN(otherV)) return null;
  const total = (isNaN(v) ? 0 : v) + (isNaN(otherV) ? 0 : otherV);
  const dir = reg.values["project_direction"] ?? ""; // область наук
  const sf = reg.values["research_direction"] ?? ""; // направление исследования
  const min = pubMinByDirSf[dir]?.[sf] ?? null;
  if (min === null) return null;
  if (total < min) {
    return `Минимальное количество публикаций Q1/Q2 (WoS + Scopus): ${min} (сейчас ${total})`;
  }
  return null;
}
export class GrantTypeD2 extends GrantType {
  name = "D.2";
  templateName = "grant_type_d2_template";
  sameIds = {
    full_name: "head_of_project",
  };
  formTitles = [
    "Форма 1. Общие сведения о научном проекте",
    "Форма 2. Содержание научного проекта",
    "Форма 3. Плановые ключевые показатели эффективности проекта",
    "Форма 4. Проект сметы расходов основных средств гранта",
    "Форма 5. Гарантийное письмо (со-финансирование)",
  ];
  directionTitle =
    "Направление науки (улучшает подсказки, не влияет на генерацию документа)";
  // Область наук управляет порогом КПЭ-2 и лимитами сметы (п.6.3.4 / 6.4 КД D.2).
  directions = [
    new DirectionNaturalScience({
      onApply: (reg) => {
        reg.get<KpiElement>("kpi_table")?.copyWith({
          // КПЭ-2 «Привлечение внешнего финансирования» — не менее 1500 тыс. руб. ежегодно
          kpiThresholds: [{ field: "kpe2", stage: "all", min: 1500 }],
        });
        reg.get<BudgetElement>("budget_table")?.copyWith({
          budgetThresholds: [
            // НТУ ≤ 10% от финансирования этапа (п.6.3.3), Open Access не учитывается
            { line: "services", year: "all", maxPercent: 0.1 },
            // ФОТ ≤ 70% (п.6.4)
            { line: "payroll", year: "all", maxPercent: 0.7 },
            // Закупки (оборуд.+материалы+командировки+НТУ, п.6.3.1–6.3.3) ≥ 30% (п.6.4)
            {
              lines: ["equipment", "materials", "travel", "services"],
              year: "all",
              minPercent: 0.3,
            },
          ],
        });
      },
    }),
    new DirectionSocialScience({
      onApply: (reg) => {
        reg.get<KpiElement>("kpi_table")?.copyWith({
          // КПЭ-2 — не менее 700 тыс. руб. ежегодно
          kpiThresholds: [{ field: "kpe2", stage: "all", min: 700 }],
        });
        reg.get<BudgetElement>("budget_table")?.copyWith({
          budgetThresholds: [
            { line: "services", year: "all", maxPercent: 0.1 },
            // ФОТ ≤ 85% (п.6.4)
            { line: "payroll", year: "all", maxPercent: 0.85 },
            // Закупки ≥ 15% (п.6.4)
            {
              lines: ["equipment", "materials", "travel", "services"],
              year: "all",
              minPercent: 0.15,
            },
          ],
        });
      },
    }),
  ];
  form1 = [
    new TextField({
      id: "project_name",
      label: "Название проекта",
      hint: "Введите название научного проекта",
      required: true,
      testValue:
        "Разработка инновационной системы искусственного интеллекта для медицинской диагностики",
    }),
    new TextField({
      id: "key_words",
      label: "Ключевые слова",
      hint: "Ключевые слова через запятую",
      required: true,
      testValue:
        "искусственный интеллект, медицинская диагностика, машинное обучение, нейронные сети, цифровая медицина",
    }),
    new TextAreaField({
      id: "science_field",
      label: "Область наук и направление научного исследования",
      hint: "OCED (http://oecd.org/science/inno/38235147.pdf); Приоритетное направление СНТР; ГРНТИ (https://grnti.ru/);",
      required: true,
      testValue:
        "ГРНТИ 28.23.37 - Искусственный интеллект;\nОЭСР 1.02 - Информатика;\nПриоритетное направление СНТР - Информационно-телекоммуникационные системы",
    }),
    new ScienceFieldSelect({
      id: "research_direction",
      label: "Направление исследования",
      required: true,
      options: [new ScienceFieldApplied(), new ScienceFieldFundamental()],
      testValue: "Прикладное",
    }),
    new CategorySelector({
      id: "project_category",
      required: true,
      detail:
        "А — руководитель переходит в РУДН на основное место работы (научный работник, 1,0 ставки), 3 года; Б — руководитель работает в РУДН по совместительству, 2 года (п.1.8 КД).",
      testValue: "А",
      options: [
        new CategoryA({
          onApply: (reg) => {
            reg.get<KpiElement>("kpi_table")?.copyWith({ horizon: 3 });
            reg.get<BudgetElement>("budget_table")?.copyWith({ horizon: 3 });
          },
        }),
        new CategoryB({
          onApply: (reg) => {
            reg.get<KpiElement>("kpi_table")?.copyWith({ horizon: 2 });
            reg.get<BudgetElement>("budget_table")?.copyWith({ horizon: 2 });
          },
        }),
      ],
    }),
    new TextAreaField({
      id: "project_annotation",
      label: "Аннотация проекта",
      hint: "Краткое описание целей и задач проекта, актуальности, научной новизны, планируемых к достижению научных результатов (до 500 символов)",
      maxChar: 500,
      required: true,
      testValue:
        "Проект направлен на создание интеллектуальной системы медицинской диагностики на основе глубокого машинного обучения.",
    }),
    new TextField({
      id: "name_of_np",
      label:
        "Название предполагаемого принимающего основного учебного (ОУП) или научного (НП) подразделения РУДН (при наличии)",
      hint: "Указывается, если известно на момент подачи заявки",
      emptyValue: "<наименование ОУП/НП>",
      testValue: "Институт математики и информатики",
    }),
    new TextField({
      id: "head_of_project",
      label: "Руководитель проекта (ФИО)",
      hint: "Фамилия Имя Отчество",
      required: true,
      testValue: "Иванов Иван Иванович",
    }),
    new TextField({
      id: "head_of_np",
      label: "Руководитель ОУП / НП (ФИО)",
      hint: "Фамилия Имя Отчество",
      testValue: "Петров Петр Петрович",
    }),
    new DateField({
      id: "date",
      label: "Дата",
      required: true,
      testValue: new Date().toISOString().slice(0, 10),
    }),
    new SelectField({
      id: "agree_disagree",
      label:
        "<Руководитель ОУП / НП> В случае поддержки проекта по итогам конкурса согласен / не согласен на выполнение проекта",
      options: [
        { value: "согласен / не согласен", label: "согласен / не согласен" },
        { value: "согласен", label: "согласен" },
        { value: "не согласен", label: "не согласен" },
      ],
      testValue: "согласен",
      includePlaceholder: false,
      defaultFirst: true,
    }),
  ];
  form2 = [
    new TextAreaField({
      id: "project_goal",
      label: "Цель проекта",
      hint: "Текст цели проекта (не более 500 символов)",
      maxChar: 500,
      required: true,
      testValue:
        "Создание высокоточной системы автоматической диагностики онкологических заболеваний с использованием технологий искусственного интеллекта.",
    }),
    new TextAreaField({
      id: "project_tasks",
      label: "Задачи проекта",
      hint: "Текст задач проекта (не более 500 символов)",
      maxChar: 500,
      required: true,
      testValue:
        "1. Разработка алгоритмов глубокого обучения; 2. Создание базы данных; 3. Обучение нейронных сетей; 4. Валидация системы.",
    }),
    new TextAreaField({
      id: "research_description",
      label: "Описание предлагаемого научного исследования / разработки",
      hint: "Текст не более 10000 символов, с рисунками(можно добавить позже в Word). Описывается актуальность планируемых научных исследований, их адекватность современному состоянию мировой науки, возможность получения новых научных результатов, теоретическая и практическая значимость",
      maxChar: 10000,
      required: true,
      testValue:
        "Актуальность исследования обусловлена потребностью в точной медицинской диагностике. Проект адекватен мировому уровню науки.",
    }),
    new TextAreaField({
      id: "scientific_methods_description",
      label:
        "Описание научных подходов и методов, используемых для решения поставленных задач",
      hint: "Описание научных подходов и методов (не более 5000 символов)",
      maxChar: 5000,
      required: true,
      testValue:
        "Методы глубокого обучения и компьютерного зрения: сети, трансформеры, transfer learning.",
    }),
    new TextAreaField({
      id: "project_background_description",
      label:
        "Описание научного задела по проекту и связанных с ним научных результатов",
      hint: "Текст не более 5000 символов, включая литературные источники",
      maxChar: 5000,
      required: true,
      testValue:
        "Коллектив имеет опыт работы с машинным обучением и медицинскими данными (публикации в IEEE, Scopus).",
    }),
    new TextAreaField({
      id: "expected_results",
      label: "Ожидаемые результаты научного исследования",
      hint: "Текст не более 5000 символов. Приводятся планируемые конкретные научные результаты проекта с разделением по этапам выполнения проекта. Приводится описание плана достижения КПЭ проекта для каждого года выполнения (приложением к обоснованию является форма 3).",
      maxChar: 5000,
      required: true,
      testValue:
        "1-й этап: прототип; 2-й этап: точность >95%, патент; 3-й этап: клиническая валидация, коммерциализация.",
    }),
    new TextAreaField({
      id: "content_of_work",
      label:
        "Состав и содержание работ по проекту. Обоснование запрашиваемого финансирования и расходов проекта.",
      hint: "Текст не более 5000 символов. План работ на каждый год реализации проекта. Обоснование необходимых расходов для каждого года выполнения (приложением является форма 4, с расшифровкой расходов на 1-й год).",
      maxChar: 5000,
      required: true,
      testValue:
        "1-й год: сбор данных, разработка; 2-й год: обучение моделей; 3-й год: клинические испытания, коммерциализация.",
    }),
    new TextAreaField({
      id: "head_of_project_qualification",
      label:
        "Состав и квалификация научного коллектива Проекта (в соответствии с п.3 конкурсной документации)",
      hint: "Для каждого члена коллектива: ФИО; место работы, должность; образование, ученая степень/звание; статус в коллективе и планируемая должность с долей ставки и видом трудоустройства; профессиональный уровень (публикации, патенты, опыт руководства и участия в НИР/НИОКР). Не менее 1 исследователя из сторонней организации на должности научного работника не менее 0,5 ставки. Для студентов и аспирантов, если ФИО неизвестны, указать планируемое количество (п.3.2.3).",
      required: true,
      testValue:
        "Профессор, д.т.н. 50+ публикаций, 3 патента, руководство 15 НИР/НИОКР.",
    }),
    new TextAreaField({
      id: "equipment",
      label:
        "Требуемое для реализации проекта оборудование/расходные материалы и пр.",
      hint: "Перечень с ориентировочной стоимостью и планом закупки по этапам.",
      required: true,
      testValue:
        "GPU-сервер NVIDIA A100, рабочие станции, медицинский сканер, ПО.",
    }),
  ];
  form3 = [
    new KpiElement({
      grantType: "D1", // строки 1-6, 8, 9, 10 — набор строк Формы 3 у D.2 совпадает с D.1
      firstFieldCriteria: {
        "Top 1%": 40,
        "Top 5%": 30,
        "Top 10%": 20,
        "Q1/Q2": 10,
      },
      thirdFieldCriteria: {
        "Участие с публикацией WoS / Scopus (Q1/Q2) ": 10,
        "Участие с публикацией WoS / Scopus (Q3/Q4/без квартиля)": 3.3,
      },
      fifthFieldCriteria: {
        "Международный патент": 40,
        "Патент на изобретение": 30,
        "Патент на полезную модель, промышленный образец": 15,
        "Программа ЭВМ, БД, топология интегральных микросхем": 5,
      },
      // БРС минимум = КАТЕГОРИЯ × НАПРАВЛЕНИЕ (Табл. 2.1 / 2.2 КД D.2).
      // 1-й год: 20% (А) / 35% (Б) от минимальной суммы БРС (п.9.3.1.1 / 9.3.1.2).
      minPoints: {
        А: [
          {
            direction: "Фундаментальное",
            minPerStage: [{ stage: 1, min: 99 }],
            minTotal: 495,
          },
          {
            direction: "Прикладное",
            minPerStage: [{ stage: 1, min: 93 }],
            minTotal: 465,
          },
        ],
        Б: [
          {
            direction: "Фундаментальное",
            minPerStage: [{ stage: 1, min: 94.5 }],
            minTotal: 270,
          },
          {
            direction: "Прикладное",
            minPerStage: [{ stage: 1, min: 87.5 }],
            minTotal: 250,
          },
        ],
      },
      requiredKpi: {
        Фундаментальное: [
          { field: "kpe1", min: 1 },
          { field: "kpe3", min: 1 },
        ],
        Прикладное: [
          { field: "kpe3", min: 1 },
          { field: "kpe4", min: 1 },
          { field: "kpe5", min: 1, fromStage: 2 },
        ],
      },
      minPercent39: 0.5, // п.3.2.2: не менее 50% исследователей до 39 лет включительно
      minPercentStudent: 0.3, // п.3.2.3: не менее 30% студентов и/или аспирантов
    }),
  ];
  form4 = [
    new BudgetElement({
      leadFieldId: "head_of_project",
      grantType: "D1", // добавляет поле left_over_explanation (как в D.1)
      minTeamSize: 4, // п.3.2.1: коллектив 4–7 человек
      maxTeamSize: 7,
    }),
  ];
  applicationTitle = "Анкета члена научного коллектива";
  applicationName = "application_template_d";
  application = [
    new SelectField({
      id: "position",
      label:
        "Руководитель / ответственный исполнитель / иные участники коллектива (указать нужное)",
      options: [{ value: "Руководитель", label: "Руководитель" }],
      defaultFirst: true,
      required: true,
      testValue: "Руководитель",
      includePlaceholder: false,
    }),
    new DateField({
      id: "birth_date",
      label: "Дата рождения",
      emptyValue: "",
      required: true,
      testValue: "1975-05-15",
      // КД D.2 не устанавливает предельный возраст руководителя (ведущего ученого),
      // поэтому проверка возраста не выполняется.
    }),
    new TextField({
      id: "citizenship",
      label:
        "Гражданство (для лиц, имеющих второе гражданство указать через запятую)",
      emptyValue: "",
      testValue: "Российская Федерация",
    }),
    new TextAreaField({
      id: "education",
      label: "Образование, наименование университета и год окончания обучения",
      emptyValue: "",
      testValue: "Высшее, МГУ им. М.В. Ломоносова, факультет ВМК, 2002 г.",
    }),
    new TextAreaField({
      id: "academic_degree",
      label: "Ученая степень, наименование университета, год получения степени",
      detail:
        "п.3.3.5 / 3.4.1: не менее 3 полных лет опыта научной работы после получения степени",
      emptyValue: "",
      minChar: 1,
      required: true,
      testValue: "Доктор технических наук, МГУ им. М.В. Ломоносова, 2012 г.",
    }),
    new TextField({
      id: "residence_country",
      label: "Страна",
      emptyValue: "",
      testValue: "Россия",
    }),
    new TextField({
      id: "residence_postal_address",
      label: "Почтовый адрес",
      emptyValue: "",
      testValue: "117198, г. Москва, ул. Миклухо-Маклая, д. 6",
    }),
    new TextField({
      id: "residence_phone",
      label: "Телефон",
      emptyValue: "",
      testValue: "+7 999 000-00-00",
    }),
    new TextField({
      id: "residence_email",
      label: "Е-mail",
      emptyValue: "",
      testValue: "ivanov@example.ru",
    }),
    new TextField({
      id: "main_work_organization",
      label: "Полное наименование организации, годы работы",
      detail: "Рекомендуем посмотреть п.3.3.5 и п.3.4",
      emptyValue: "",
      testValue: "Российский университет дружбы народов имени Патриса Лумумбы",
    }),
    new TextField({
      id: "main_work_position",
      label: "Должность",
      emptyValue: "",
      testValue: "Профессор",
    }),
    new TextField({
      id: "main_work_years",
      label: "Годы работы (с указанием до месяцев)",
      hint: "например, 09.2012 – по н.в.",
      emptyValue: "",
      testValue: "09.2012 – по настоящее время",
    }),
    new TextField({
      id: "main_work_country",
      label: "Страна",
      emptyValue: "",
      testValue: "Россия",
    }),
    new TextField({
      id: "main_work_postal_address",
      label: "Почтовый адрес",
      emptyValue: "",
      testValue: "117198, г. Москва, ул. Миклухо-Маклая, д. 6",
    }),
    new TextField({
      id: "main_work_phone",
      label: "Телефон",
      emptyValue: "",
      testValue: "+7 495 000-00-00",
    }),
    new TextField({
      id: "main_work_fax",
      label: "Факс",
      emptyValue: "",
      testValue: "+7 495 000-00-01",
    }),
    new TextField({
      id: "main_work_email",
      label: "Е-mail",
      emptyValue: "",
      testValue: "ivanov@rudn.ru",
    }),
    new TextField({
      id: "prev_work_organization",
      label: "Полное наименование организации, годы работы",
      emptyValue: "",
      testValue: "МГУ им. М.В. Ломоносова",
    }),
    new TextField({
      id: "prev_work_position",
      label: "Должность",
      emptyValue: "",
      testValue: "Доцент",
    }),
    new TextField({
      id: "prev_work_years",
      detail: "Рекомендуем посмотреть п.3.3.5 и п.3.4",
      label: "Годы работы (с указанием до месяцев)",
      emptyValue: "",
      testValue: "09.2005 – 08.2012",
    }),
    new TextField({
      id: "prev_work_country",
      label: "Страна",
      emptyValue: "",
      testValue: "Россия",
    }),
    new TextField({
      id: "prev_work_postal_address",
      label: "Почтовый адрес",
      emptyValue: "",
      testValue: "119991, г. Москва, Ленинские горы, д. 1",
    }),
    new TextField({
      id: "prev_work_phone",
      label: "Телефон",
      emptyValue: "",
      testValue: "+7 495 000-00-02",
    }),
    new TextField({
      id: "prev_work_fax",
      label: "Факс",
      emptyValue: "",
      testValue: "+7 495 000-00-03",
    }),
    new TextField({
      id: "prev_work_email",
      label: "Е-mail",
      emptyValue: "",
      testValue: "ivanov@msu.ru",
    }),
    new TextField({
      id: "researchgate_url",
      label: "ResearchGate (ссылка на аккаунт)",
      emptyValue: "",
      testValue: "https://www.researchgate.net/profile/Ivan-Ivanov",
    }),
    new TextField({
      id: "google_scholar_url",
      label: "Google Scholar (ссылка на аккаунт)",
      emptyValue: "",
      testValue: "https://scholar.google.com/citations?user=XXXXXXX",
    }),
    new TextField({
      id: "scopus_author_id",
      label: "Scopus Author ID (или ссылка на аккаунт)",
      emptyValue: "",
      testValue: "57190000000",
    }),
    new TextField({
      id: "researcher_id_wos",
      label: "Researcher ID Web of Science",
      emptyValue: "",
      testValue: "AAA-1234-2020",
    }),
    new TextField({
      id: "orcid_id",
      label: "ORCID ID",
      emptyValue: "",
      testValue: "0000-0002-1825-0097",
    }),
    new TextField({
      id: "spin_code_rinc",
      label: "SPIN-код автора в РИНЦ",
      emptyValue: "",
      testValue: "1234-5678",
    }),
    new NumberField({
      id: "publications_count_wos",
      label: "Количество публикаций WoS (всего / с 01.01.2021)",
      detail:
        "п.3.3.1: учитываются только публикации Q1/Q2 за период с 01.01.2021",
      emptyValue: "",
      testValue: "45",
      verificationFunction: (value, reg) =>
        pubVerification(value, "publications_count_scopus", reg),
    }),
    new NumberField({
      id: "publications_count_scopus",
      label: "Количество публикаций Scopus (всего / с 01.01.2021)",
      detail:
        "п.3.3.1: учитываются только публикации Q1/Q2 за период с 01.01.2021",
      emptyValue: "",
      testValue: "52",
      verificationFunction: (value, reg) =>
        pubVerification(value, "publications_count_wos", reg),
    }),
    new NumberField({
      id: "publications_count_rinc",
      label: "Количество публикаций РИНЦ (при наличии)",
      emptyValue: "",
      testValue: "80",
    }),
    new NumberField({
      id: "citations_count_wos",
      label: "Количество цитирований WoS (всего / с 01.01.2021)",
      emptyValue: "",
      testValue: "600",
    }),
    new NumberField({
      id: "citations_count_scopus",
      label: "Количество цитирований Scopus (всего / с 01.01.2021)",
      emptyValue: "",
      testValue: "720",
    }),
    new NumberField({
      id: "citations_count_rinc",
      label: "Количество цитирований РИНЦ (при наличии)",
      emptyValue: "",
      testValue: "1500",
    }),
    new TextField({
      id: "hirsch_index",
      label: "Индекс Хирша (WoS / Scopus / РИНЦ)",
      hint: "формат: WoS / Scopus / РИНЦ",
      emptyValue: "",
      testValue: "12 / 14 / 20",
    }),
    new Row({
      id: "scientific_activity",
      label:
        "Научная деятельность члена научного коллектива, его основные научные достижения (перечислить)",
      increasable: true,
      elements: [
        new RowElementTextField({
          id: "activity",
          label: "Достижение",
          testValue:
            "Разработка алгоритмов глубокого обучения для анализа медицинских изображений",
        }),
      ],
    }),
    new Row({
      id: "awards",
      label:
        "Премии и награды члена научного коллектива (международные, государственные)",
      increasable: true,
      elements: [
        new RowElementTextField({
          id: "name",
          label: "Название премии/награды",
          testValue: "Премия за вклад в медицинскую информатику",
        }),
        new RowElementTextField({
          id: "issuer",
          label: "Кем выдана",
          testValue: "РУДН",
        }),
        new RowElementNumberField({
          id: "year",
          label: "Год получения",
          hint: "ГГГГ",
          testValue: "2024",
        }),
        new RowElementTextField({
          id: "achievement",
          label: "Достижение, за которое вручена премия/награда",
          testValue: "Создание системы ИИ-диагностики",
        }),
      ],
    }),
    new Row({
      id: "publications",
      label:
        "Ключевые публикации по направлению тематики проекта (не более 10, за период с 01.01.2021)",
      increasable: true,
      maxRows: 10,
      elements: [
        new RowElementTextField({
          id: "source",
          label: "Издание",
          testValue: "IEEE Transactions on Medical Imaging",
        }),
        new RowElementTextField({
          id: "authors",
          label: "Авторы (в порядке, указанном в публикации)",
          testValue: "Ivanov I., Petrov P.",
        }),
        new RowElementTextField({
          id: "title",
          label: "Название публикации",
          testValue: "Deep Learning for Cancer Detection",
        }),
        new RowElementTextField({
          id: "type",
          label: "Вид публикации",
          testValue: "Статья",
        }),
        new RowElementTextField({
          id: "year_volume",
          label: "Год, том, выпуск",
          testValue: "2023, т. 42, вып. 5",
        }),
        new RowElementTextField({
          id: "doi",
          label: "DOI",
          testValue: "10.1109/TMI.2023.0000000",
        }),
      ],
    }),
    new Row({
      id: "rids",
      label:
        "РИД и заявки на регистрацию РИД по направлению тематики проекта (за период с 01.01.2021)",
      increasable: true,
      // п.3.3.4: для прикладных проектов не менее 2 РИД; для фундаментальных не применяется
      minRowsByScience: { Фундаментальное: 0, Прикладное: 2 },
      elements: [
        new RowElementTextField({
          id: "name",
          label: "Наименование патента, год выхода",
          testValue: "Способ автоматической диагностики, 2023",
        }),
        new RowElementTextField({
          id: "authors",
          label: "Авторы (с указанием патентообладателя)",
          testValue: "Иванов И.И. (патентообладатель РУДН)",
        }),
        new RowElementTextField({
          id: "details",
          label: "Выходные данные",
          testValue: "Патент РФ № 2700000, опубл. 01.06.2023",
        }),
      ],
    }),
    new Row({
      id: "conferences",
      label:
        "Конференции по направлению тематики проекта (за период с 01.01.2021)",
      increasable: true,
      elements: [
        new RowElementTextField({
          id: "name",
          label: "Название конференции",
          testValue: "MICCAI 2023",
        }),
        new RowElementTextField({
          id: "place_time",
          label: "Место и время проведения",
          testValue: "Ванкувер, Канада, октябрь 2023",
        }),
        new RowElementTextField({
          id: "url",
          label: "Ссылка на сайт конференции в сети Интернет",
          testValue: "https://miccai2023.org",
        }),
        new RowElementTextField({
          id: "report",
          label: "Авторы и название доклада",
          testValue: "Ivanov I. AI-based diagnostics",
        }),
        new RowElementTextField({
          id: "type",
          label: "Тип доклада (пленарный, обычный, устный/постер)",
          testValue: "устный",
        }),
      ],
    }),
    new Row({
      id: "projects",
      label:
        "Участие в научных проектах (грантах), хоздоговорных НИР, НИР по гос. заданию (за период с 01.01.2021)",
      detail:
        "п.3.3.2 и п.3.3.3: требуется не менее 1 проекта в качестве руководителя И не менее 1 проекта в качестве участника",
      increasable: true,
      minRows: 2,
      elements: [
        new RowElementTextField({
          id: "fund",
          label: "Фонд (источник финансирования)",
          testValue: "РНФ",
        }),
        new RowElementTextField({
          id: "name_number",
          label:
            "Название проекта, номер проекта по классификации источника финансирования",
          testValue: "ИИ в медицине, № 23-00-00000",
        }),
        new RowElementTextField({
          id: "egisu_number",
          label: "Номер регистрационной карты проекта в системе ЕГИСУ НИОКТР",
          testValue: "АААА-А23-000000000000-0",
        }),
        new RowElementTextField({
          id: "years_funding",
          label: "Годы реализации, объем финансирования",
          testValue: "2023–2025, 5 млн руб.",
        }),
        new RowElementTextField({
          id: "role",
          label: "Должность (исполнитель / руководитель)",
          testValue: "руководитель",
        }),
      ],
    }),
    new TextAreaField({
      id: "additional_info",
      label: "Дополнительная информация о себе",
      emptyValue: "",
      testValue: "Член редколлегии профильного журнала, эксперт РНФ.",
    }),
  ];
  guaranteeLetter = [
    new TextField({
      id: "organization_name",
      label: "Наименование организации",
      hint: "Название организации",
      required: true,
      testValue: "Российский университет дружбы народов имени Патриса Лумумбы",
    }),
    new TextField({
      id: "project_name",
      label: "Название проекта",
      hint: "Наименование проекта в соответствии с заявкой",
      testValue:
        "Разработка инновационной системы искусственного интеллекта для медицинской диагностики",
    }),
    new TextField({
      id: "head_of_project",
      label: "Руководитель проекта (ФИО)",
      hint: "Фамилия Имя Отчество",
      testValue: "Иванов Иван Иванович",
    }),
    new NumberField({
      id: "cofinance_stage_1",
      label: "Софинансирование, 1-й этап (руб.)",
      hint: "Сумма в рублях",
      emptyValue: "",
      testValue: "500000",
    }),
    new NumberField({
      id: "cofinance_stage_2",
      label: "Софинансирование, 2-й этап (руб.)",
      hint: "Сумма в рублях",
      emptyValue: "",
      testValue: "500000",
    }),
    new NumberField({
      id: "cofinance_stage_3",
      label: "Софинансирование, 3-й этап (руб.), для категории А",
      hint: "Сумма в рублях (при наличии)",
      emptyValue: "",
      testValue: "500000",
      showWhen: (ctx) => ctx.category.code === "А" || ctx.category.code === "",
    }),
    new TextField({
      id: "org_inn",
      label: "ИНН организации",
      hint: "ИНН",
      testValue: "7729086366",
    }),
    new TextField({
      id: "org_ogrn",
      label: "ОГРН организации",
      hint: "ОГРН",
      testValue: "1027739661538",
    }),
    new TextField({
      id: "org_kpp",
      label: "КПП организации",
      hint: "КПП",
      testValue: "772901001",
    }),
    new TextField({
      id: "org_addr",
      label: "Юридический и почтовый адрес",
      hint: "Юридический и почтовый адрес",
      testValue: "117198, г. Москва, ул. Миклухо-Маклая, д. 6.",
    }),
    new TextField({
      id: "org_phone",
      label: "Телефон",
      hint: "Телефон",
      testValue: "+79777777777",
    }),
    new TextField({
      id: "org_okved",
      label: "Деятельность в соответствии с ОКВЭД",
      hint: "Деятельность в соответствии с ОКВЭД",
      testValue: "45.44.1",
    }),
    new TextField({
      id: "head_of_org_occupation",
      label: "Руководитель организации (Должность)",
      hint: "Должность",
      testValue: "CEO",
    }),
    new TextField({
      id: "head_of_organization",
      label: "Руководитель организации",
      hint: "инициалы и фамилия",
      testValue: "В.П. Филиппов",
    }),
    new TextField({
      id: "head_acc_of_org_occupation",
      label: "Главный бухгалтер организации (Должность)",
      hint: "Должность",
      testValue: "Бухгалтер",
    }),
    new TextField({
      id: "head_acc_of_org",
      label: "Главный бухгалтер организации",
      hint: "инициалы и фамилия",
      testValue: "А.В. Сидорова",
    }),
  ];
}
