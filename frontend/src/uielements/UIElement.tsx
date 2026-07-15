import type { ReactNode } from 'react';
import type { Category } from '../categories/Category';

export interface DrawContext {
  value: string;
  onChange: (value: string) => void;
  category: Category;
  values: Record<string, string>;
}

export interface UIElementInit {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  testValue?: string;
  detail?: string | null;
  emptyValue?: string | null;
}

/** Handed to `onTest` so an element can push test data into the form state. */
export interface TestContext {
  setValue: (id: string, value: string) => void;
}

export abstract class UIElement {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  required: boolean;
  readonly testValue?: string;
  readonly detail: string | null;
  readonly emptyValue?: string | null;

  constructor(init: UIElementInit) {
    this.id = init.id;
    this.label = init.label;
    this.hint = init.hint;
    this.required = init.required ?? false;
    this.testValue = init.testValue;
    this.detail = init.detail ?? null;
    this.emptyValue = init.emptyValue;
  }

  /** Fluent override: mutate own fields from `partial` and return this. */
  copyWith(partial: Partial<this>): this {
    Object.assign(this, partial);
    return this;
  }

  /** Shallow snapshot of own (data) fields, for reverting restrictions. */
  captureState(): Record<string, unknown> {
    return { ...this } as Record<string, unknown>;
  }

  /** Restore previously snapshotted own fields. */
  restoreState(snap: Record<string, unknown>): void {
    Object.assign(this, snap);
  }

  abstract draw(ctx: DrawContext): ReactNode;

  /**
   * Fill this element with test data. The base implementation writes its own
   * `testValue` (if any) into the shared form state. Composite elements that
   * own their internal state override this to fill themselves.
   */
  onTest(ctx: TestContext): void {
    if (this.testValue !== undefined) {
      ctx.setValue(this.id, this.testValue);
    }
  }

  collect(value: string): Record<string, unknown> {
    const isEmpty = value.trim() === '';
    const v = isEmpty && this.emptyValue != null ? this.emptyValue : value;
    return { [this.id]: v };
  }

  collectFor(values: Record<string, string>): Record<string, unknown> {
    return this.collect(values[this.id] ?? '');
  }

  check(_value: string): string | null {
    return null;
  }
}
