import type { ReactNode } from "react";
import type { SelectOption } from "./SelectField";

/**
 * Abstract sub-field rendered inside a `Row`. Each concrete subclass renders a
 * single horizontally-laid-out input. The `[id, label, hint]` triple is the
 * minimum contract every RowElement carries.
 *
 * RowElements render plain, self-contained inputs (not full UIElement fields)
 * so that a Row can repeat the same sub-field id across many rows without
 * producing duplicate DOM `id`/`name` attributes.
 */
export abstract class RowElement {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly testValue?: string;
  readonly emptyValue?: string;

  constructor(init: { id: string; label: string; hint?: string; testValue?: string; emptyValue?: string }) {
    this.id = init.id;
    this.label = init.label;
    this.hint = init.hint;
    this.testValue = init.testValue;
    this.emptyValue = init.emptyValue ?? "";
  }

  /** Render this sub-field's input. `value`/`onChange` are row-scoped strings. */
  abstract render(value: string, onChange: (v: string) => void): ReactNode;
}

export class RowElementTextField extends RowElement {
  render(value: string, onChange: (v: string) => void): ReactNode {
    return (
      <div className="form-group">
        <label>{this.label}</label>
        <input
          type="text"
          placeholder={this.hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {this.hint && value.trim() === "" && (
          <div className="field-hint">{this.hint}</div>
        )}
      </div>
    );
  }
}

export class RowElementNumberField extends RowElement {
  render(value: string, onChange: (v: string) => void): ReactNode {
    return (
      <div className="form-group">
        <label>{this.label}</label>
        <input
          type="number"
          placeholder={this.hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {this.hint && value.trim() === "" && (
          <div className="field-hint">{this.hint}</div>
        )}
      </div>
    );
  }
}

export class RowElementSelectField extends RowElement {
  readonly options: SelectOption[];
  readonly placeholder?: string;

  constructor(
    init: { id: string; label: string; hint?: string; testValue?: string; options: SelectOption[]; placeholder?: string },
  ) {
    super(init);
    this.options = init.options;
    this.placeholder = init.placeholder;
  }

  render(value: string, onChange: (v: string) => void): ReactNode {
    return (
      <div className="form-group">
        <label>{this.label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{this.placeholder ?? "Выберите значение"}</option>
          {this.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
