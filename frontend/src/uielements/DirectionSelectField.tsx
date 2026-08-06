import { SelectField } from './SelectField';

/** A SelectField whose value is never written into the generated document. */
export class DirectionSelectField extends SelectField {
  collectFor(): Record<string, unknown> {
    return {};
  }
}
