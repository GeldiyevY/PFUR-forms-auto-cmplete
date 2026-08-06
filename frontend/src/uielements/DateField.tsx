import { TextField, type TextFieldInit } from './TextField';
import type { DrawContext } from './UIElement';

/** Custom verification callback. Receives the current value and the full draw
 * context (`reg.values` to read any other field by id, `reg.category` for А/Б).
 * Return a non-empty string to show it as a warning; return null/undefined/empty
 * when everything is fine. */
export type DateFieldVerify = (
  value: string,
  reg: DrawContext,
) => string | null | undefined;

export interface DateFieldInit extends TextFieldInit {
  verificationFunction?: DateFieldVerify;
}

export class DateField extends TextField {
  readonly inputType = 'date';

  constructor(init: DateFieldInit) {
    super(init);
    this.verificationFunction = init.verificationFunction;
  }
}
