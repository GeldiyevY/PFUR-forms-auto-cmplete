import Section from '../components/Section';
import type { FormData } from '../types/form';

interface RudnDepartmentProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function RudnDepartment({ data, onChange }: RudnDepartmentProps) {
  return (
    <Section title="Подразделение РУДН">
      <div className="form-group">
        <label htmlFor="name_of_np">
          Название предполагаемого принимающего (ОУП) или (НП) подразделения РУДН
        </label>
        <input
          type="text"
          id="name_of_np"
          name="name_of_np"
          required
          placeholder="Название подразделения РУДН"
          value={data.name_of_np}
          onChange={(e) => onChange('name_of_np', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="full_name_of_np">ФИО руководителя подразделения РУДН</label>
        <input
          type="text"
          id="full_name_of_np"
          name="full_name_of_np"
          placeholder="ФИО руководителя ОУП или НП (если известно)"
          value={data.full_name_of_np}
          onChange={(e) => onChange('full_name_of_np', e.target.value)}
        />
      </div>
    </Section>
  );
}
