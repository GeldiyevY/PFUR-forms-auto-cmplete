import { TextField, type TextFieldInit } from './TextField';

export interface NumberFieldInit extends TextFieldInit {}

export class NumberField extends TextField {
  readonly inputType = 'number';

  constructor(init: NumberFieldInit) {
    super(init);
    this.verificationFunction = init.verificationFunction;
  }
}
