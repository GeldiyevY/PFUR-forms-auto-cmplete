import Section from '../components/Section';
import TextField from '../components/TextField';
import type { FormData } from '../types/form';

interface RudnDepartmentProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function RudnDepartment({ data, onChange }: RudnDepartmentProps) {
  return (
    <Section title="Подразделение РУДН">
      <TextField
        id="name_of_np"
        label="Название предполагаемого принимающего (ОУП) или (НП) подразделения РУДН"
        required
        hint="Название подразделения РУДН"
        value={data.name_of_np}
        onChange={(v) => onChange('name_of_np', v)}
      />

      <TextField
        id="full_name_of_np"
        label="ФИО руководителя подразделения РУДН"
        hint="ФИО руководителя ОУП или НП (если известно)"
        value={data.full_name_of_np}
        onChange={(v) => onChange('full_name_of_np', v)}
      />
    </Section>
  );
}
