import type { ReactNode } from "react";
import { UIElement, type DrawContext, type TestContext } from "./UIElement";
import { RowElement } from "./RowElement";
import RowView from "../components/RowView";

export interface RowInit {
  /** Global id → docxtemplater loop tag {#id}…{/id}. */
  id: string;
  /** Section / row label shown above the block. */
  label: string;
  /** Sub-fields rendered horizontally inside each row. */
  elements: RowElement[];
  /** When true, a "+" button appears on the last row to add another row. */
  increasable?: boolean;
  /** Minimum number of rows (cannot remove below this). Default 1. */
  minRows?: number;
  /** Maximum number of rows (blocks "+" when reached). Default 20. */
  maxRows?: number;
  /** Optional hint/description shown under the label. */
  hint?: string;
  /** Optional detail text shown via info icon on hover. */
  detail?: string | null;
  /** Per-science-field min rows overrides keyed by science field code. */
  minRowsByScience?: Record<string, number>;
  /** Per-science-field max rows overrides keyed by science field code. */
  maxRowsByScience?: Record<string, number>;
}

/** A single row's data: sub-field id → string value. */
export type RowData = Record<string, string>;

export class Row extends UIElement {
  elements: RowElement[];
  increasable: boolean;
  minRows: number;
  maxRows: number;
  readonly minRowsByScience?: Record<string, number>;
  readonly maxRowsByScience?: Record<string, number>;
  readonly baseMinRows: number;
  readonly baseMaxRows: number;

  /** Live row data, written by the view via useEffect so collect()/onTest can read it. */
  rows: RowData[] = [];
  setRows: (rows: RowData[]) => void = () => {};

  constructor(init: RowInit) {
    super({ id: init.id, label: init.label, hint: init.hint, detail: init.detail });
    this.elements = init.elements;
    this.increasable = init.increasable ?? false;
    this.minRowsByScience = init.minRowsByScience;
    this.maxRowsByScience = init.maxRowsByScience;
    this.baseMinRows = init.minRows ?? 1;
    this.baseMaxRows = init.maxRows ?? 20;
    this.minRows = this.baseMinRows;
    this.maxRows = this.baseMaxRows;
    this.rows = Array.from({ length: this.minRows }, () => ({}));
  }

  collectFor(): Record<string, unknown> {
    return this.collect();
  }

  collect(): Record<string, unknown> {
    return {
      [this.id]: this.rows.map((r, i) => {
        const filled: RowData = { number: String(i + 1) };
        for (const el of this.elements) {
          const v = r[el.id];
          filled[el.id] = v !== undefined && v !== "" ? v : (el.emptyValue ?? "");
        }
        return filled;
      }),
    };
  }

  draw(ctx: DrawContext): ReactNode {
    const sf = ctx.values?.["research_direction"] ?? "";
    this.minRows = this.minRowsByScience?.[sf] ?? this.baseMinRows;
    this.maxRows = this.maxRowsByScience?.[sf] ?? this.baseMaxRows;
    return <RowView element={this} />;
  }

  onTest(_ctx: TestContext): void {
    const sample: RowData = {};
    for (const el of this.elements) {
      sample[el.id] = el.testValue ?? "";
    }
    this.setRows([sample]);
  }
}
