import { Category } from './Category';

/** Concrete default representing "nothing chosen". No restrictions applied. */
export class CategoryNone extends Category {
  code: '' = '';
  label = '—';
}
