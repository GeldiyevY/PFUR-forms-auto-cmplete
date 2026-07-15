import { GrantType } from "./GrantType";
import { TextField } from "../uielements/TextField";
import { TextAreaField } from "../uielements/TextAreaField";
import { SelectField } from "../uielements/SelectField";
import { CategorySelector } from "../uielements/CategorySelector";
import { ScienceFieldSelect } from "../uielements/ScienceFieldSelect";
import { DateField } from "../uielements/DateField";
import { ScienceFieldApplied } from "../science_field/ScienceFieldApplied";
import { ScienceFieldFundamental } from "../science_field/ScienceFieldFundamental";
import { KpiElement } from "../uielements/KpiElement";
import { BudgetElement } from "../uielements/BudgetElement";
import { CategoryA } from "../categories/CategoryA";
import { CategoryB } from "../categories/CategoryB";

export class GrantTypeR1 extends GrantType {
  name = "R.1";
  templateName = "grant_type_r1_template";
  formTitles = [
    "Форма 1. Общие сведения о научном проекте",
    "Форма 2. Содержание научного проекта",
    "Форма 3. Плановые ключевые показатели эффективности проекта",
    "Форма 4. Проект сметы расходов основных средств гранта",
    "Анкета Руководителя Проекта",
    "Гарантийное письмо",
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
      detail: "A на 3 года; B на 2 года.",
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
      hint: "Текст не более 5000 символов Приводятся планируемые конкретные научные результаты проекта (новые научные знания, продукты, технологии и пр.) с разделением по этапам выполнения проекта. Приводится описание плана достижения ключевых показателей эффективности проекта для каждого года выполнения (приложением к обоснованию является форма 3).",
      maxChar: 5000,
      required: true,
      testValue:
        "1-й этап: прототип; 2-й этап: точность >95%, патент; 3-й этап: клиническая валидация, коммерциализация.",
    }),
    new TextAreaField({
      id: "content_of_work",
      label:
        "Состав и содержание работ по проекту. Обоснование запрашиваемого финансирования и расходов проекта.",
      hint: "Текст не более 5000 символов. Приводится описание плана работ на каждый год реализации проекта. Приводится обоснование необходимых расходов для каждого года выполнения (приложением к обоснованию является форма 4, в которой дается подробная расшифровка расходов на 1-й год выполнения проекта).",
      maxChar: 5000,
      required: true,
      testValue:
        "1-й год: сбор данных, разработка; 2-й год: обучение моделей; 3-й год: клинические испытания, коммерциализация.",
    }),
    new TextAreaField({
      id: "head_of_project_qualification",
      label:
        "Квалификация руководителя Проекта (в соответствии с п.3 конкурсной документации)",
      hint: "Текущее место работы, должность; Образование и специальность, ученая степень, ученое звание; Статус в научном коллективе проекта (руководитель, ответственный исполнитель, сотрудник); Планируемая должность в научном коллективе проекта (младший научный сотрудник, научный сотрудник, старший научный сотрудник, ведущий научный сотрудник, главный научный сотрудник, лаборант, инженер) с указанием планируемой доли ставки и вида трудоустройства (основное место работы, по внутреннему / внешнему совместительству, совмещение должностей); Профессиональный уровень (опыт научных публикаций по тематике проекта, регистрации патентов, авторских свидетельств, опыт руководства и участия в НИР/НИОКР и пр.).",
      required: true,
      testValue:
        "Профессор, д.т.н. 50+ публикаций, 3 патента, руководство 15 НИР/НИОКР.",
    }),
    new TextAreaField({
      id: "equipment",
      label:
        "Требуемое для реализации проекта оборудование/расходные материалы и пр.",
      hint: "Приводится перечень с указанием ориентировочной стоимости, плана по закупке с указанием в рамках какого этапа выполнения проекта планируется приобретение оборудования",
      required: true,
      testValue:
        "GPU-сервер NVIDIA A100, рабочие станции, медицинский сканер, ПО.",
    }),
  ];

  form3 = [
    new KpiElement({
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
      minTotalPoints: {
        А: 165,
        Б: 70,
      },
    }),
  ];

  form4 = [
    new BudgetElement({
      leadFieldId: "head_of_project",
      minTeamSize: 1,
    }),
  ];

  application = [];

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
    new TextField({
      id: "position",
      label: "Должность",
      hint: "Название должности",
      testValue: "Ректор университета",
    }),
  ];
}
