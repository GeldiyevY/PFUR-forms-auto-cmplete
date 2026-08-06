import type { UIElement } from '../uielements/UIElement';

export interface ElementRegistry {
  get<T extends UIElement>(id: string): T | undefined;
  all(): UIElement[];
}

export interface DirectionOptions {
  onApply?: (reg: ElementRegistry) => void;
  onRevert?: (reg: ElementRegistry) => void;
}

export abstract class Direction {
  abstract code: string;
  abstract label: string;

  private readonly onApply?: (reg: ElementRegistry) => void;
  private readonly onRevert?: (reg: ElementRegistry) => void;
  private saved?: Record<string, Record<string, unknown>>;

  constructor(opts?: DirectionOptions) {
    this.onApply = opts?.onApply;
    this.onRevert = opts?.onRevert;
  }

  /** Apply this direction's restrictions. Snapshots current element state first. */
  onSelect(reg: ElementRegistry): void {
    this.saved = {};
    for (const el of reg.all()) {
      this.saved[el.id] = el.captureState();
    }
    this.onApply?.(reg);
  }

  /** Revert to the state captured in onSelect. */
  onDeselect(reg: ElementRegistry): void {
    if (this.saved) {
      for (const el of reg.all()) {
        const snap = this.saved[el.id];
        if (snap) el.restoreState(snap);
      }
    }
    this.saved = undefined;
    this.onRevert?.(reg);
  }
}
