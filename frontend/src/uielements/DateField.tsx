import { TextField } from './TextField';

export class DateField extends TextField {
  constructor(init: { id: string; label: string; hint?: string; required?: boolean; testValue?: string }) {
    super({ ...init, type: 'date' });
  }
}
