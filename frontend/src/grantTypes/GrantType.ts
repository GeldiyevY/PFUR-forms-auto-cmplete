import type { UIElement, TestContext, DrawContext } from "../uielements/UIElement";
import { DirectionSelectField } from "../uielements/DirectionSelectField";
import type { Direction } from "../direction/Direction";
import type { Category } from "../categories/Category";

export abstract class GrantType {
  abstract name: string;
  /**
   * Main Word template. Set to `null` to disable document generation entirely
   * (no template is loaded and nothing is downloaded). When `null`, ALL forms
   * (form1..form4, application, guaranteeLetter) must also be `null` — otherwise
   * `getErrors()` reports a configuration error.
   */
  abstract templateName: string | null;
  /** Optional second template (e.g. application form) appended after the main one. Empty/null = ignored. */
  applicationName: string | null = null;
  abstract formTitles: string[];
  abstract form1: UIElement[] | null;
  abstract form2: UIElement[] | null;
  abstract form3: UIElement[] | null;
  abstract form4: UIElement[] | null;
  /** Optional extra form (e.g. анкета участника). Omit or set to null to hide the whole section — even if `applicationName` is set. */
  application?: UIElement[] | null;
  /** Title shown above the `application` form. Separate from `formTitles`. */
  applicationTitle?: string;
  abstract guaranteeLetter: UIElement[] | null;

  /** Research directions offered between form2 and form3. Empty = no UI change. */
  directions: Direction[] = [];
  /** Russian title/note shown on the direction select field. */
  directionTitle: string =
    "Направление науки (влияет на корректность отображаемых примечаний)";

  values: Record<string, unknown> = {};

  /**
   * Mapping of document template placeholder IDs (keys) to UI field IDs (values).
   * Keys are placeholders that exist in the .docx template but NOT in the UI form.
   * Values are UI field IDs that have their own placeholders in the template.
   * During payload generation, each key will be added to the payload with the
   * value from its corresponding UI field. The original UI field's placeholder
   * is NOT affected.
   *
   * Example: { "full_name": "head_of_project" } means {full_name} in the
   * document gets the value from the "head_of_project" UI field, while
   * {head_of_project} placeholders still get their own value.
   */
  sameIds: Record<string, string> = {};

  /**
   * A select field rendered between form2 and form3 when `directions` is non-empty.
   * Its value is never placed into the generated document.
   */
  get directionField() {
    if (this.directions.length === 0) return null;
    return new DirectionSelectField({
      id: "project_direction",
      label: this.directionTitle,
      required: false,
      options: this.directions.map((d) => ({ value: d.code, label: d.label })),
      placeholder: "Выберите направление науки",
      testValue: this.directions[0]?.code,
    });
  }

  /** Main + optional application + guarantee forms, skipping any null/empty form. */
  getForms(): UIElement[][] {
    const forms = [this.form1, this.form2, this.form3, this.form4].filter(
      (f): f is UIElement[] => Array.isArray(f) && f.length > 0,
    );
    if (this.application && this.application.length > 0) forms.push(this.application);
    if (this.guaranteeLetter && this.guaranteeLetter.length > 0) forms.push(this.guaranteeLetter);
    return forms;
  }

  /**
   * Validate grant-type configuration invariants:
   *  - Both `templateName` and `applicationName` null → nothing can be generated (unconditional error).
   *  - If `templateName` is null, the MAIN forms (form1..form4, guaranteeLetter) must be null too.
   *    The `application` form is NOT governed by `templateName` — it depends only on `applicationName`.
   *  - If `applicationName` is null, `application` must be null too.
   * Returns a list of Russian error messages; empty array means valid.
   */
  getErrors(): string[] {
    const errors: string[] = [];

    if (this.templateName === null && this.applicationName === null) {
      errors.push(
        "Ошибка конфигурации: не заданы ни основной шаблон (templateName), ни шаблон анкеты (applicationName). Документ не может быть сформирован.",
      );
      return errors;
    }

    if (this.templateName === null) {
      const hasMainForm =
        (this.form1 && this.form1.length > 0) ||
        (this.form2 && this.form2.length > 0) ||
        (this.form3 && this.form3.length > 0) ||
        (this.form4 && this.form4.length > 0) ||
        (this.guaranteeLetter && this.guaranteeLetter.length > 0);
      if (hasMainForm) {
        errors.push(
          "Ошибка конфигурации: templateName равен null, но заданы основные формы (form1–form4 / гарантийное письмо). Если основной шаблон отключён, они должны быть null. Форма анкеты (application) зависит только от applicationName.",
        );
      }
    }

    if (this.applicationName === null && this.application && this.application.length > 0) {
      errors.push(
        "Ошибка конфигурации: applicationName равен null, но задана форма application. Установите application в null либо задайте applicationName.",
      );
    }

    return errors;
  }

  collect(values: Record<string, string>, category: Category): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const form of this.getForms()) {
      for (const el of form) {
        if (el.showWhen) {
          const ctx: DrawContext = {
            value: values[el.id] ?? "",
            onChange: () => {},
            category,
            values,
          };
          if (!el.showWhen(ctx)) {
            Object.assign(payload, el.collect(""));
            continue;
          }
        }
        Object.assign(payload, el.collectFor(values));
      }
    }

    // Apply sameIds mapping: document placeholders (keys) get values from UI fields (values)
    for (const [docPlaceholderId, uiFieldId] of Object.entries(this.sameIds)) {
      if (uiFieldId in payload) {
        payload[docPlaceholderId] = payload[uiFieldId];
      }
    }

    return payload;
  }

  /** Ask every element to fill itself with test data. */
  fillTest(ctx: TestContext): void {
    for (const form of this.getForms()) {
      for (const el of form) {
        el.onTest(ctx);
      }
    }
    const dir = this.directionField;
    if (dir) dir.onTest(ctx);
  }

  getTemplateUrl(): string {
    return this.templateName ? `/${this.templateName}.docx` : "";
  }
}
