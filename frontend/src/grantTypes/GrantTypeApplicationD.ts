import { GrantType } from "./GrantType";
import { TextField } from "../uielements/TextField";
import { NumberField } from "../uielements/NumberField";
import { TextAreaField } from "../uielements/TextAreaField";
import { SelectField } from "../uielements/SelectField";
import { DateField } from "../uielements/DateField";
import { Row } from "../uielements/Row";
import {
  RowElementTextField,
  RowElementNumberField,
} from "../uielements/RowElement";
import type { DrawContext } from "../uielements/UIElement";

/*
 * Анкета члена научного коллектива (Приложение 3 КД D.1-2026 / D.2-2026).
 *
 * Самостоятельный тип гранта: основной шаблон отсутствует (templateName = null),
 * генерируется только анкета (application_template_d.docx). Статус в научном
 * коллективе выбирается пользователем, от него зависят предупреждения.
 *
 * ПРАВИЛА ЭТОГО ФАЙЛА
 *
 * 1. Поля формы = placeholders в application_template_d.docx. Исключение —
 *    четыре служебных поля (конкурс, категория, область наук, тип
 *    исследования), разрешённые явно: без них большинство требований КД
 *    неразличимы. В label каждого из них в скобках указано, что поле влияет
 *    только на подсказки и в генерируемый документ не выводится.
 * 2. Никаких эвристик по введённому тексту. Код не угадывает по словам
 *    «аспирант», «РУДН» и т. п., кто заполняет анкету. Требования, зависящие
 *    от неизвестных коду обстоятельств, перечислены в подсказках построчно:
 *    «кто — какой минимум».
 * 3. Никакого общего контекста между заявками. reg.category и значения полей
 *    других вкладок не используются: verificationFunction читает только поля
 *    ЭТОЙ ЖЕ формы через reg.values — так же, как pubVerification в
 *    GrantTypeD1 / GrantTypeD2 / GrantTypeR1.
 *
 * Источники требований:
 *  - КД D.1-2026 (приказ №1329-р от 28.07.2025), пп. 3.1–3.4, 4.3, 8.2–8.3;
 *  - КД D.2-2026 (приказ №1327-р от 28.07.2025), пп. 3.1–3.4, 4.3, 8.2–8.3.
 */

/* ------------------------------------------------------------------ *
 *  Служебные поля (в документ не выводятся)
 * ------------------------------------------------------------------ */

/** Обязательная приписка к label каждого служебного поля. */
const SERVICE_NOTE =
  "(служебное поле: влияет только на подсказки и предупреждения, в генерируемый документ не выводится)";

const SUBTYPE_D1 = "D.1";
const SUBTYPE_D2 = "D.2";

const SUBTYPE_OPTIONS = [
  {
    value: SUBTYPE_D1,
    label: "D.1-2026 — проекты под руководством молодых учёных",
  },
  {
    value: SUBTYPE_D2,
    label: "D.2-2026 — проекты под руководством ведущих учёных",
  },
];

const CATEGORY_OPTIONS = [
  {
    value: "А",
    label: "А — 3 года реализации (возрастной ценз на 31.12.2028)",
  },
  {
    value: "Б",
    label: "Б — 2 года реализации (возрастной ценз на 31.12.2027)",
  },
];

const DIRECTION_OPTIONS = [
  { value: "Естественнонаучное", label: "Естественнонаучное / техническое" },
  { value: "Социально-гуманитарное", label: "Социально-гуманитарное" },
];
const DIRECTIONS = DIRECTION_OPTIONS.map((o) => o.value);

const SCIENCE_FIELD_OPTIONS = [
  { value: "Фундаментальное", label: "Фундаментальное" },
  { value: "Прикладное", label: "Прикладное" },
];
const SCIENCE_FIELDS = SCIENCE_FIELD_OPTIONS.map((o) => o.value);

/** Возрастной ценз: последний день реализации проекта соответствующей категории. */
const CUTOFF_BY_CATEGORY: Record<string, string> = {
  А: "2028-12-31",
  Б: "2027-12-31",
};

/* ------------------------------------------------------------------ *
 *  Статусы в научном коллективе (значения placeholder {position})
 * ------------------------------------------------------------------ */

const ROLE_HEAD = "Руководитель";
const ROLE_RESPONSIBLE = "Ответственный исполнитель";
const ROLE_MEMBER = "Иной участник научного коллектива";

/**
 * Все допустимые значения {position} — ровно три, как в форме анкеты.
 * Студенты, аспиранты и ординаторы отдельного статуса не имеют и указываются
 * как «Иной участник научного коллектива». Определить их по анкете нельзя,
 * поэтому требования к ним перечислены в подсказках (см. MIN_* ниже).
 */
const ROLES = [ROLE_HEAD, ROLE_RESPONSIBLE, ROLE_MEMBER];

/* ------------------------------------------------------------------ *
 *  Чтение значений полей ЭТОЙ ЖЕ формы
 * ------------------------------------------------------------------ */

const val = (reg: DrawContext, id: string): string =>
  String(reg.values[id] ?? "").trim();

const role = (reg: DrawContext): string => val(reg, "position");
const isHead = (reg: DrawContext) => role(reg) === ROLE_HEAD;

/** Служебные поля. Пустая строка = пользователь не выбрал, требования выводятся диапазоном. */
const subtype = (reg: DrawContext): string => val(reg, "grant_subtype");
const subtypeLabel = (reg: DrawContext): string =>
  subtype(reg) || "D.1/D.2 (конкурс не выбран)";
const categoryCode = (reg: DrawContext): string => val(reg, "project_category");
const hasDegree = (reg: DrawContext): boolean =>
  val(reg, "academic_degree") !== "";

/* ------------------------------------------------------------------ *
 *  Минимумы по статусам — статический текст для подсказок
 *  (код не определяет, кто заполняет анкету, поэтому перечисляем всех)
 * ------------------------------------------------------------------ */

const MIN_AGE =
  "Возраст. Руководитель D.1 — не более 39 лет на 31.12.2028 (категория А) или на 31.12.2027 (категория Б), п.3.1. Руководитель D.2 — без ограничения. Ответственный исполнитель и иной участник — без ограничения, но возраст влияет на квоту исследователей до 39 лет (п.3.2.2), а участнику старше 39 лет без учёной степени и не обучающемуся РУДН нужно письменное обоснование от руководителя (п.3.4.3). Студент, аспирант, ординатор РУДН — без ограничения.";

const MIN_DEGREE =
  "Учёная степень. Руководитель — обязательна (п.3.1 D.1, п.3.3.1 D.2). Ответственный исполнитель и иной участник — не обязательна, но без неё нужно высшее образование по тематике проекта и стаж не менее 3 полных лет (п.3.4.3). Студент, аспирант, ординатор РУДН очной формы — не требуется (п.3.4.2).";

const MIN_EXPERIENCE =
  "Стаж. Руководитель — не менее 3 полных лет (п.3.3.4 D.1, п.3.3.5 D.2). Участник с учёной степенью — не менее 3 полных лет (п.3.4.1). Участник без степени, не обучающийся РУДН — не менее 3 полных лет плюс профильное высшее образование (п.3.4.3). Студент, аспирант, ординатор РУДН очной формы — не требуется.";

const MIN_PUBLICATIONS =
  "Минимум публикаций WoS и/или Scopus. Руководитель D.1: естественнонаучное фундаментальное — 5, естественнонаучное прикладное — 4, социально-гуманитарное фундаментальное — 4, социально-гуманитарное прикладное — 2 (для фундаментальных проектов не менее 1 публикации в изданиях Q1/Q2). Руководитель D.2: 5 / 5 / 4 / 3 соответственно, и только в изданиях Q1/Q2. Ответственный исполнитель и иной участник — минимум не установлен. Студент, аспирант, ординатор — не обязательно, показатели указываются при наличии (п.4.3).";

const MIN_RIDS =
  "Минимум РИД. Руководитель прикладного проекта: D.1 — 1 (п.3.3.3), D.2 — 2 (п.3.3.4). Руководитель фундаментального проекта — не требуется. Ответственный исполнитель, иной участник, студент, аспирант, ординатор — не требуется.";

const MIN_PROJECTS =
  "Минимум проектов. Руководитель D.1 — 1 проект в качестве руководителя или участника (п.3.3.2). Руководитель D.2 — 1 проект в качестве руководителя (п.3.3.2) и 1 в качестве участника (п.3.3.3). Ответственный исполнитель, иной участник, студент, аспирант, ординатор — не требуется. Проекты Системы грантовой поддержки РУДН не учитываются, зарубежные фонды засчитываются с коэффициентом ×2 (сноска 6).";

const WHO_FILLS =
  "Кто заполняет анкету. Руководитель, ответственный исполнитель и иные научные работники — всегда. Студент, аспирант, ординатор — только при наличии самостоятельно полученных результатов без соавторства с другими членами коллектива либо при планируемом трудоустройстве на должность младшего научного сотрудника (сноска 9).";

/* ------------------------------------------------------------------ *
 *  Публикационные пороги руководителя (п.3.3.1)
 * ------------------------------------------------------------------ */

// D.1: публикации WoS и/или Scopus за период с 01.01.2021.
// D.2: только издания Q1/Q2 за тот же период. Квартиль в анкете не
// запрашивается, поэтому сумма WoS + Scopus — лишь нижняя оценка.
const PUB_MIN: Record<string, Record<string, Record<string, number>>> = {
  [SUBTYPE_D1]: {
    Естественнонаучное: { Фундаментальное: 5, Прикладное: 4 },
    "Социально-гуманитарное": { Фундаментальное: 4, Прикладное: 2 },
  },
  [SUBTYPE_D2]: {
    Естественнонаучное: { Фундаментальное: 5, Прикладное: 5 },
    "Социально-гуманитарное": { Фундаментальное: 4, Прикладное: 3 },
  },
};

/* ------------------------------------------------------------------ *
 *  Разбор значений
 * ------------------------------------------------------------------ */

/**
 * Ячейка «всего / с 01.01.2022»: возвращает оба числа.
 * Для проверки порога используется второе (за период), если оно указано.
 */
function parseCountPair(value: string): {
  total: number | null;
  since: number | null;
} {
  const nums = (value ?? "").match(/\d+/g);
  if (!nums || nums.length === 0) return { total: null, since: null };
  return {
    total: Number(nums[0]),
    since: nums.length > 1 ? Number(nums[1]) : null,
  };
}

/** Формат ячейки «всего / с 01.01.2022» (одно или два числа через дробь). */
function countFormatWarning(value: string): string | null {
  const v = (value ?? "").trim();
  if (v === "") return null;
  if (!/^\d+(\s*\/\s*\d+)?$/.test(v)) {
    return "Проверьте формат: ожидается «всего / с 01.01.2022», например «12 / 6» (или одно число).";
  }
  return null;
}

/** «09.2012» / «2012» → Date. Возвращает null, если не распознано. */
function parseMonthYear(s: string): Date | null {
  const m = s.match(/(\d{1,2})[.\/-](\d{4})/);
  if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1);
  const y = s.match(/(\d{4})/);
  if (y) return new Date(Number(y[1]), 0, 1);
  return null;
}

/** Полных лет по строке «начало – конец». Возвращает null, если не распознано. */
function yearsOfExperience(value: string): number | null {
  if (!value) return null;
  const parts = value.split(/[–—-]|по\s/);
  const startRaw = parts[0] ?? "";
  const start = parseMonthYear(startRaw);
  if (!start) return null;
  const tail = value.slice(startRaw.length);
  const isCurrent = /н\.?\s?в\.?|настоящее время|present/i.test(tail);
  const end = isCurrent ? new Date() : parseMonthYear(tail);
  if (!end) return null;
  let years = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  if (m < 0) years--;
  return years < 0 ? 0 : years;
}

/* ------------------------------------------------------------------ *
 *  Проверки
 * ------------------------------------------------------------------ */

/**
 * Стаж не менее 3 полных лет. Предупреждение выводится только там, где
 * требование применимо гарантированно:
 *  - руководитель (п.3.3.4 D.1 / п.3.3.5 D.2);
 *  - любой член коллектива, у которого заполнена учёная степень (п.3.4.1).
 * Для участника без степени статус (обучающийся РУДН или нет) по анкете не
 * определяется, поэтому вместо предупреждения выводится текст MIN_EXPERIENCE.
 */
function experienceCheck(reg: DrawContext): string | null {
  if (role(reg) === "") return null;
  if (!isHead(reg) && !hasDegree(reg)) return null;

  const main = yearsOfExperience(val(reg, "main_work_years"));
  const prev = yearsOfExperience(val(reg, "prev_work_years"));
  if (main === null && prev === null) return null;

  const total = (main ?? 0) + (prev ?? 0);
  if (total >= 3) return null;

  const parts: string[] = [];
  if (main !== null) parts.push(`основное ≈ ${main} г.`);
  if (prev !== null) parts.push(`предыдущее ≈ ${prev} г.`);
  const who = isHead(reg)
    ? "п.3.3.4 КД D.1 / п.3.3.5 КД D.2 для руководителя"
    : "п.3.4.1 для члена коллектива с учёной степенью";
  return `Стаж меньше 3 полных лет (${who}). Распознано: ${parts.join(", ")}. Соответствие опыта тематике проекта автоматически не проверяется.`;
}

/** Возраст: ценз для руководителя D.1 (п.3.1) и учёт в квоте п.3.2.2. */
function birthDateCheck(value: string, reg: DrawContext): string | null {
  if (!value) return null;
  const birth = new Date(value);
  if (isNaN(birth.getTime())) return null;

  const ageAt = (cutoff: string): number | null => {
    const end = new Date(cutoff);
    if (isNaN(end.getTime())) return null;
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  const knownCutoff = CUTOFF_BY_CATEGORY[categoryCode(reg)] ?? null;

  if (isHead(reg)) {
    // D.2: возрастного ценза для руководителя нет (конкурс ведущих учёных).
    if (subtype(reg) === SUBTYPE_D2) return null;

    const source =
      subtype(reg) === SUBTYPE_D1
        ? "п.3.1 КД D.1"
        : "п.3.1 КД D.1 (конкурс не выбран; для D.2 возрастной ценз не применяется)";

    if (knownCutoff) {
      const age = ageAt(knownCutoff);
      if (age !== null && age > 39) {
        return `${source}: возраст руководителя на ${knownCutoff} не должен превышать 39 лет; сейчас будет ${age}.`;
      }
      return null;
    }

    // Категория не выбрана — проверяем оба срока реализации.
    const ageB = ageAt("2027-12-31");
    const ageA = ageAt("2028-12-31");
    if (ageB !== null && ageB > 39) {
      return `${source}: возраст руководителя превысит 39 лет и на 31.12.2027 (${ageB}), и на 31.12.2028 (${ageA}) — не подходит ни категория Б, ни категория А.`;
    }
    if (ageA !== null && ageA > 39) {
      return `${source}: на 31.12.2028 возраст составит ${ageA} лет — допустима только категория Б (2 года реализации); для категории А ценз не выполняется.`;
    }
    return null;
  }

  const cutoff = knownCutoff ?? "2027-12-31";
  const age = ageAt(cutoff);
  if (age === null || age <= 39) return null;

  return `Возраст на ${cutoff} составит ${age} лет: участник не входит в число исследователей до 39 лет (их должно быть не менее 70% для D.1 и 50% для D.2, п.3.2.2 — считается по заявке в целом). ${MIN_AGE}`;
}

/** Применимые пороги публикаций с учётом выбранных служебных полей. */
function applicableMinimums(reg: DrawContext): number[] {
  const st = subtype(reg);
  const dirRaw = val(reg, "project_direction");
  const sfRaw = val(reg, "research_direction");

  const subtypes =
    st === SUBTYPE_D1 || st === SUBTYPE_D2 ? [st] : [SUBTYPE_D1, SUBTYPE_D2];
  const dirs = DIRECTIONS.includes(dirRaw) ? [dirRaw] : DIRECTIONS;
  const sfs = SCIENCE_FIELDS.includes(sfRaw) ? [sfRaw] : SCIENCE_FIELDS;

  const mins: number[] = [];
  for (const s of subtypes) {
    for (const d of dirs) {
      for (const sf of sfs) {
        const m = PUB_MIN[s]?.[d]?.[sf];
        if (typeof m === "number") mins.push(m);
      }
    }
  }
  return mins;
}

/** Публикации WoS + Scopus: порог п.3.3.1 предъявляется только к руководителю. */
function pubCheck(
  value: string,
  otherId: string,
  reg: DrawContext,
): string | null {
  const fmt = countFormatWarning(value);
  if (fmt) return fmt;
  if (!isHead(reg)) return null;

  const own = parseCountPair(value);
  const other = parseCountPair(val(reg, otherId));
  const ownN = own.since ?? own.total;
  const otherN = other.since ?? other.total;
  if (ownN === null && otherN === null) return null;
  const total = (ownN ?? 0) + (otherN ?? 0);

  const mins = applicableMinimums(reg);
  if (mins.length === 0) return null;
  const lo = Math.min.apply(null, mins);
  const hi = Math.max.apply(null, mins);

  const q =
    subtype(reg) === SUBTYPE_D1
      ? ""
      : " Для D.2 в зачёт идут только издания 1-го и 2-го квартиля — квартиль в анкете не запрашивается и не проверяется.";
  const period =
    " Порог КД считается за период с 01.01.2021, анкета запрашивает данные с 01.01.2022 — периоды не совпадают.";

  if (total < lo) {
    return `п.3.3.1 КД ${subtypeLabel(reg)}: у руководителя ${total} публикаций WoS + Scopus при минимуме ${lo} даже по самому мягкому требованию.${q}${period}`;
  }
  if (total < hi) {
    return `п.3.3.1 КД ${subtypeLabel(reg)}: у руководителя ${total} публикаций WoS + Scopus, а требуется от ${lo} до ${hi}. Выберите конкурс, область наук и тип исследования в служебных полях вверху формы, чтобы получить точный порог.${q}${period}`;
  }
  return null;
}

/** Учёная степень: обязательна для руководителя (п.3.1 D.1 / п.3.3.1 D.2). */
function degreeCheck(value: string, reg: DrawContext): string | null {
  const filled = (value ?? "").trim().length > 0;
  if (role(reg) === "") return null;

  if (isHead(reg) && !filled) {
    return subtype(reg) === SUBTYPE_D2
      ? "п.3.3.1 КД D.2: руководителем проекта может быть только исследователь, имеющий учёную степень."
      : `п.3.1 КД ${subtypeLabel(reg)}: руководителем проекта может быть только исследователь, имеющий учёную степень.`;
  }
  if (!filled) {
    return `Учёная степень не указана. ${MIN_DEGREE}`;
  }
  return null;
}

/** Пояснения, зависящие только от выбранного статуса. */
function roleNotes(value: string, reg: DrawContext): string | null {
  const r = (value ?? "").trim() || role(reg);
  if (r === "") return null;

  if (r === ROLE_HEAD) {
    return `Руководитель ${subtypeLabel(reg)}: проверяются учёная степень, возраст, публикации и стаж. НЕ проверяются автоматически: п.3.4.4 (руководство незавершённым на 31.12.2025 проектом СГП РУДН, досрочно прекращённый проект, успешное завершение этого же конкурса менее 2 лет назад), п.3.4.5 (участие в двух незавершённых проектах СГП РУДН) и требования к составу коллектива п.3.2.1–3.2.3 (4–7 человек, доли исследователей до 39 лет и обучающихся) — они относятся к заявке в целом, а не к отдельной анкете.`;
  }
  return `${MIN_DEGREE} ${MIN_EXPERIENCE} Отдельного статуса для студентов, аспирантов и ординаторов в анкете нет, поэтому код не определяет, относятся ли к вам требования п.3.4.2 или п.3.4.3 — сверьтесь со списком выше. Конфликт интересов (п.3.4.6) и участие в двух незавершённых проектах СГП РУДН (п.3.4.5) в анкете не проверяются.`;
}

/* ------------------------------------------------------------------ *
 *  Проверки формата
 * ------------------------------------------------------------------ */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_URL = /^https?:\/\/\S+$/i;

function emailWarning(value: string): string | null {
  const v = (value ?? "").trim();
  if (v === "") return null;
  return RE_EMAIL.test(v)
    ? null
    : "Проверьте формат адреса электронной почты (например, ivanov@rudn.ru).";
}

function urlWarning(value: string, example: string): string | null {
  const v = (value ?? "").trim();
  if (v === "") return null;
  return RE_URL.test(v)
    ? null
    : `Ожидается ссылка вида ${example} (начинается с https://).`;
}

export class GrantTypeApplicationD extends GrantType {
  name = "Анкета члена научного коллектива (D.1 / D.2)";

  // Основной шаблон отсутствует — генерируется только анкета.
  templateName = null;
  applicationName = "application_template_d";

  formTitles: string[] = [];
  form1 = null;
  form2 = null;
  form3 = null;
  form4 = null;
  guaranteeLetter = null;

  applicationTitle = "Анкета члена научного коллектива (Приложение 3)";

  application = [
    /* ---------------- Служебные поля (в документ не выводятся) --------------- */
    new SelectField({
      id: "grant_subtype",
      label: `Конкурс ${SERVICE_NOTE}`,
      detail:
        "Определяет пороги публикаций, требования к РИД и проектам, а также наличие возрастного ценза у руководителя. Если не выбран — предупреждения выводятся сразу по обоим конкурсам",
      options: SUBTYPE_OPTIONS,
      required: false,
      includePlaceholder: true,
      placeholder: "Выберите конкурс",
      testValue: SUBTYPE_D1,
    }),
    new SelectField({
      id: "project_category",
      label: `Категория проекта ${SERVICE_NOTE}`,
      detail:
        "Определяет дату, на которую считается возраст руководителя: категория А — 31.12.2028, категория Б — 31.12.2027. Если не выбрана — проверяются обе даты",
      options: CATEGORY_OPTIONS,
      required: false,
      includePlaceholder: true,
      placeholder: "Выберите категорию",
      testValue: "А",
    }),
    new SelectField({
      id: "project_direction",
      label: `Область наук проекта ${SERVICE_NOTE}`,
      detail:
        "Влияет на минимальное количество публикаций руководителя (п.3.3.1)",
      options: DIRECTION_OPTIONS,
      required: false,
      includePlaceholder: true,
      placeholder: "Выберите область наук",
      testValue: "Естественнонаучное",
    }),
    new SelectField({
      id: "research_direction",
      label: `Тип исследования ${SERVICE_NOTE}`,
      detail:
        "Влияет на минимальное количество публикаций (п.3.3.1) и на требование к РИД у руководителя прикладного проекта (п.3.3.3 D.1 / п.3.3.4 D.2)",
      options: SCIENCE_FIELD_OPTIONS,
      required: false,
      includePlaceholder: true,
      placeholder: "Выберите тип исследования",
      testValue: "Прикладное",
    }),

    /* ---------------- Статус в научном коллективе ---------------- */
    new SelectField({
      id: "position",
      label:
        "Статус в научном коллективе проекта (руководитель / ответственный исполнитель / иной участник)",
      detail: `Три значения, как в форме анкеты: студенты, аспиранты и ординаторы указываются как «Иной участник научного коллектива». ${WHO_FILLS}`,
      options: ROLES.map((r) => ({ value: r, label: r })),
      required: true,
      includePlaceholder: true,
      placeholder: "Выберите статус в научном коллективе",
      testValue: ROLE_MEMBER,
      verificationFunction: (value, reg) => roleNotes(value, reg),
    }),

    /* ---------------- Личные данные ---------------- */
    new TextField({
      id: "full_name",
      label: "Фамилия Имя Отчество",
      required: true,
      emptyValue: "",
      testValue: "Петров Пётр Петрович",
      verificationFunction: (value) => {
        const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return null;
        if (parts.length < 2) {
          return "Укажите фамилию, имя и отчество полностью (как в документах).";
        }
        return null;
      },
    }),
    new DateField({
      id: "birth_date",
      label: "Дата рождения",
      detail: MIN_AGE,
      emptyValue: "",
      required: true,
      testValue: "1990-05-15",
      verificationFunction: (value, reg) => birthDateCheck(value, reg),
    }),
    new TextField({
      id: "citizenship",
      label:
        "Гражданство (для лиц, имеющих второе гражданство указать через запятую)",
      emptyValue: "",
      testValue: "Российская Федерация",
    }),

    /* ---------------- Образование и степень ---------------- */
    new TextAreaField({
      id: "education",
      label: "Образование, наименование университета и год окончания обучения",
      detail: `Копия диплома включается в состав заявки (п.4.3). ${MIN_DEGREE}`,
      emptyValue: "",
      testValue: "Высшее, МГУ им. М.В. Ломоносова, факультет ВМК, 2002 г.",
      verificationFunction: (value, reg) => {
        if (role(reg) === "") return null;
        if (hasDegree(reg)) return null;
        if ((value ?? "").trim().length > 0) return null;
        return `Не указаны ни учёная степень, ни образование. ${MIN_DEGREE}`;
      },
    }),
    new TextAreaField({
      id: "academic_degree",
      label: "Ученая степень, наименование университета, год получения степени",
      detail: MIN_DEGREE,
      emptyValue: "",
      testValue: "Кандидат технических наук, РУДН, 2018 г.",
      verificationFunction: (value, reg) => degreeCheck(value, reg),
    }),

    /* ---------------- Место жительства ---------------- */
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
      testValue: "petrov@example.ru",
      verificationFunction: (value) => emailWarning(value),
    }),

    /* ---------------- Основное место работы ---------------- */
    new TextField({
      id: "main_work_organization",
      label: "Полное наименование организации, годы работы",
      detail:
        "Трудоустройство. Все члены коллектива трудоустраиваются в РУДН при поддержке проекта (п.8.2); руководитель категории А — на 1.0 ставки по основному месту работы, категории Б — по внутреннему совместительству (п.8.3). Студент, аспирант, ординатор должны обучаться в РУДН по очной форме (п.3.4.2) — это подтверждается справкой (п.4.3). Ни трудоустройство, ни форма обучения по анкете не проверяются",
      emptyValue: "",
      testValue: "Российский университет дружбы народов имени Патриса Лумумбы",
    }),
    new TextField({
      id: "main_work_position",
      label: "Должность",
      emptyValue: "",
      testValue: "Доцент",
    }),
    new TextField({
      id: "main_work_years",
      label: "Годы работы (с указанием до месяцев)",
      hint: "например, 09.2012 – по н.в.",
      detail: `Суммируется со стажем по предыдущему месту работы. ${MIN_EXPERIENCE}`,
      emptyValue: "",
      testValue: "09.2012 – по настоящее время",
      verificationFunction: (_value, reg) => experienceCheck(reg),
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
      testValue: "petrov@rudn.ru",
      verificationFunction: (value) => emailWarning(value),
    }),

    /* ---------------- Предыдущие места работы ---------------- */
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
      testValue: "Ассистент",
    }),
    new TextField({
      id: "prev_work_years",
      label: "Годы работы (с указанием до месяцев)",
      hint: "например, 09.2009 – 08.2012",
      detail: `Суммируется со стажем по основному месту работы. ${MIN_EXPERIENCE}`,
      emptyValue: "",
      testValue: "09.2009 – 08.2012",
      verificationFunction: (_value, reg) => experienceCheck(reg),
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
      testValue: "petrov@msu.ru",
      verificationFunction: (value) => emailWarning(value),
    }),

    /* ---------------- Профили в базах цитирования ---------------- */
    new TextField({
      id: "researchgate_url",
      label: "ResearchGate (ссылка на аккаунт)",
      emptyValue: "",
      testValue: "https://www.researchgate.net/profile/Petr-Petrov",
      verificationFunction: (value) =>
        urlWarning(value, "https://www.researchgate.net/profile/..."),
    }),
    new TextField({
      id: "google_scholar_url",
      label: "Google Scholar (ссылка на аккаунт)",
      emptyValue: "",
      testValue: "https://scholar.google.com/citations?user=XXXXXXX",
      verificationFunction: (value) =>
        urlWarning(value, "https://scholar.google.com/citations?user=..."),
    }),
    new TextField({
      id: "scopus_author_id",
      label: "Scopus Author ID (или ссылка на аккаунт)",
      emptyValue: "",
      testValue: "57190000000",
      verificationFunction: (value) => {
        const v = (value ?? "").trim();
        if (v === "") return null;
        if (RE_URL.test(v) || /^\d{10,11}$/.test(v)) return null;
        return "Scopus Author ID состоит из 10–11 цифр (либо укажите полную ссылку на профиль).";
      },
    }),
    new TextField({
      id: "researcher_id_wos",
      label: "Researcher ID Web of Science",
      emptyValue: "",
      testValue: "AAA-1234-2020",
      verificationFunction: (value) => {
        const v = (value ?? "").trim();
        if (v === "") return null;
        if (RE_URL.test(v) || /^[A-Za-z]{1,3}-\d{4}-\d{4}$/.test(v))
          return null;
        return "Проверьте формат Researcher ID: например, AAA-1234-2020.";
      },
    }),
    new TextField({
      id: "orcid_id",
      label: "ORCID ID",
      emptyValue: "",
      testValue: "0000-0002-1825-0097",
      verificationFunction: (value) => {
        const v = (value ?? "").trim();
        if (v === "") return null;
        if (/\d{4}-\d{4}-\d{4}-\d{3}[\dXx]/.test(v)) return null;
        return "Проверьте формат ORCID: 0000-0000-0000-0000 (последний символ может быть X).";
      },
    }),
    new TextField({
      id: "spin_code_rinc",
      label: "SPIN-код автора в РИНЦ",
      emptyValue: "",
      testValue: "1234-5678",
      verificationFunction: (value) => {
        const v = (value ?? "").trim();
        if (v === "") return null;
        if (/^\d{4}-?\d{4}$/.test(v)) return null;
        return "SPIN-код РИНЦ состоит из 8 цифр, например 1234-5678.";
      },
    }),

    /* ---------------- Наукометрические показатели ---------------- */
    // В анкете каждая ячейка содержит два числа («всего / с 01.01.2022»),
    // поэтому это текстовые поля, а не числовые.
    new TextField({
      id: "publications_count_wos",
      label: "Количество публикаций WoS (всего / с 01.01.2022)",
      hint: "например, 12 / 6",
      detail: MIN_PUBLICATIONS,
      emptyValue: "",
      testValue: "12 / 6",
      verificationFunction: (value, reg) =>
        pubCheck(value, "publications_count_scopus", reg),
    }),
    new TextField({
      id: "publications_count_scopus",
      label: "Количество публикаций Scopus (всего / с 01.01.2022)",
      hint: "например, 14 / 8",
      detail: MIN_PUBLICATIONS,
      emptyValue: "",
      testValue: "14 / 8",
      verificationFunction: (value, reg) =>
        pubCheck(value, "publications_count_wos", reg),
    }),
    new NumberField({
      id: "publications_count_rinc",
      label: "Количество публикаций РИНЦ (при наличии)",
      emptyValue: "",
      testValue: "20",
    }),
    new TextField({
      id: "citations_count_wos",
      label: "Количество цитирований WoS (всего / с 01.01.2022)",
      hint: "например, 100 / 40",
      emptyValue: "",
      testValue: "100 / 40",
      verificationFunction: (value) => countFormatWarning(value),
    }),
    new TextField({
      id: "citations_count_scopus",
      label: "Количество цитирований Scopus (всего / с 01.01.2022)",
      hint: "например, 120 / 50",
      emptyValue: "",
      testValue: "120 / 50",
      verificationFunction: (value) => countFormatWarning(value),
    }),
    new NumberField({
      id: "citations_count_rinc",
      label: "Количество цитирований РИНЦ (при наличии)",
      emptyValue: "",
      testValue: "300",
    }),
    new TextField({
      id: "hirsch_index",
      label: "Индекс Хирша (WoS / Scopus / РИНЦ)",
      hint: "формат: WoS / Scopus / РИНЦ, например 5 / 6 / 9",
      emptyValue: "",
      testValue: "5 / 6 / 9",
      verificationFunction: (value) => {
        const v = (value ?? "").trim();
        if (v === "") return null;
        if (/^\d+(\s*\/\s*\d+){0,2}$/.test(v)) return null;
        return "Проверьте формат: ожидается «WoS / Scopus / РИНЦ», например «5 / 6 / 9».";
      },
    }),

    /* ---------------- Научная деятельность и достижения ---------------- */
    new Row({
      id: "scientific_activity",
      label:
        "Научная деятельность члена научного коллектива, его основные научные достижения (перечислить)",
      increasable: true,
      elements: [
        new RowElementTextField({
          id: "activity",
          label: "Достижение",
          testValue: "Разработка методов обработки медицинских изображений",
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
          testValue: "Премия для молодых учёных",
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
          testValue: "Цикл работ по машинному обучению",
        }),
      ],
    }),
    new Row({
      id: "publications",
      label:
        "Ключевые публикации по направлению тематики проекта (не более 10, за период с 01.01.2022)",
      detail: `${MIN_PUBLICATIONS} Порог проверяется по наукометрическим показателям выше; квартиль издания (Q1/Q2 для D.2) в анкете не запрашивается`,
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
          testValue: "Petrov P., Ivanov I.",
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
        "РИД и заявки на регистрацию РИД по направлению тематики проекта (за период с 01.01.2022)",
      detail: `${MIN_RIDS} Минимум по строкам не задан: он зависит от статуса участника и типа исследования, а Row.minRows статичен`,
      increasable: true,
      elements: [
        new RowElementTextField({
          id: "name",
          label: "Наименование патента, год выхода",
          testValue: "Способ автоматической диагностики, 2023",
        }),
        new RowElementTextField({
          id: "authors",
          label: "Авторы (с указанием патентообладателя)",
          testValue: "Петров П.П. (патентообладатель — РУДН)",
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
        "Конференции по направлению тематики проекта (за период с 01.01.2022)",
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
          testValue: "Petrov P. AI-based diagnostics",
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
        "Участие в научных проектах (грантах), хоздоговорных НИР, НИР по государственному заданию (за период с 01.01.2022)",
      detail: `${MIN_PROJECTS} Содержимое столбца «Должность» автоматически не анализируется`,
      increasable: true,
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
          testValue: "исполнитель",
        }),
      ],
    }),

    /* ---------------- Дополнительно ---------------- */
    new TextAreaField({
      id: "additional_info",
      label: "Дополнительная информация о себе",
      emptyValue: "",
      testValue: "Участник научных школ, рецензент профильных журналов.",
    }),
  ];
}

/* ==================================================================== *
 *  ЧТО НЕВОЗМОЖНО ПРОВЕРИТЬ В ЭТОМ КЛАССЕ
 *
 *  1. Требования к составу коллектива (п.3.2.1–3.2.3): 4–7 человек, доля
 *     исследователей до 39 лет, доля студентов и аспирантов. Каждая анкета —
 *     отдельный экземпляр GrantType со своим values, доступа к другим анкетам
 *     нет. Нужен контейнер «заявка = проект + N анкет».
 *  2. Уникальность руководителя, дублирование ФИО, соответствие анкет п.2.8
 *     формы 2.
 *  3. Кто именно заполняет анкету: студент, аспирант, ординатор или научный
 *     работник. В форме {position} только три значения, эвристики по тексту
 *     удалены. Требования по каждой категории выведены в подсказки MIN_*.
 *  4. Очная форма обучения в РУДН (п.3.4.2), медицинское направление проекта
 *     для ординаторов (сноска 5), справки и дипломы (п.4.3) — нет ни полей,
 *     ни загрузки файлов.
 *  5. Ограничения п.3.4.4–3.4.6: незавершённые проекты СГП РУДН, досрочно
 *     прекращённые проекты, конфликт интересов. Данных нет ни в анкете, ни в
 *     классе.
 *  6. Трудоустройство и доля ставки (п.8.2–8.3), лимит оплаты труда
 *     руководителя 200 000 ₽ в месяц — в Приложении 3 таких полей нет.
 *  7. Содержимое строк таблиц: у Row / RowElement нет verificationFunction.
 *     Нельзя проверить наличие проекта с ролью «руководитель» (п.3.3.2 D.2),
 *     количество РИД (п.3.3.3 D.1 / п.3.3.4 D.2), год премии, формат DOI,
 *     период публикаций. Row.minRows и minRowsByScience статичны и не зависят
 *     от статуса участника, поэтому не заданы.
 *  8. required — статический флаг, а не функция от контекста: обязательность
 *     полей по статусу выражена только предупреждениями.
 *  9. Квартиль публикаций (Q1/Q2) в анкете не запрашивается; период КД
 *     (с 01.01.2021) не совпадает с периодом анкеты (с 01.01.2022);
 *     коэффициент ×2 для зарубежных фондов и исключение проектов СГП РУДН
 *     (сноска 6) требуют разбора свободного текста.
 * 10. Соответствие образования, стажа, публикаций и РИД тематике проекта.
 * 11. Служебные поля (grant_subtype, project_category, project_direction,
 *     research_direction) заполняются вручную и не сверяются с формой 2
 *     заявки: общего контекста между вкладками у этого класса нет.
 * ==================================================================== */
