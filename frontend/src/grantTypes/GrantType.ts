import type { UIElement, TestContext } from "../uielements/UIElement";

export abstract class GrantType {
  abstract name: string;
  abstract templateName: string;
  abstract formTitles: string[];
  abstract form1: UIElement[];
  abstract form2: UIElement[];
  abstract form3: UIElement[];
  abstract form4: UIElement[];
  abstract application: UIElement[];
  abstract guaranteeLetter: UIElement[] | null;

  values: Record<string, unknown> = {};

  getForms(): UIElement[][] {
    const forms = [
      this.form1,
      this.form2,
      this.form3,
      this.form4,
      this.application,
    ];
    if (this.guaranteeLetter) forms.push(this.guaranteeLetter);
    return forms;
  }

  collect(values: Record<string, string>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const form of this.getForms()) {
      for (const el of form) {
        Object.assign(payload, el.collectFor(values));
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
  }

  getTemplateUrl(): string {
    return `/${this.templateName}.docx`;
  }
}
