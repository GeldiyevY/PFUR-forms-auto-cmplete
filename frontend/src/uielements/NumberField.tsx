import { TextField } from './TextField';

export class NumberField extends TextField {
  constructor(init: { id: string; label: string; hint?: string; required?: boolean }) {
    super({ ...init, type: 'number' });
  }
}
