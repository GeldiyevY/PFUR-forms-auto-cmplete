import Section from '../components/Section';
import TextField from '../components/TextField';
import TextAreaField from '../components/TextAreaField';
import type { FormData } from '../types/form';

interface PersonalDataProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function PersonalData({ data, onChange }: PersonalDataProps) {
  return (
    <Section title="Личные данные">
      <div className="two-column">
        <TextField
          id="head_of_project"
          label="Руководитель проекта (ФИО)"
          required
          hint="Фамилия Имя Отчество"
          value={data.head_of_project}
          onChange={(v) => onChange('head_of_project', v)}
        />

        <TextField
          id="head_of_np"
          label="Руководитель ОУП / НП (ФИО)"
          required
          hint="Фамилия Имя Отчество"
          value={data.head_of_np}
          onChange={(v) => onChange('head_of_np', v)}
        />
      </div>

      <TextAreaField
        id="head_of_project_qualification"
        label="Квалификация руководителя проекта"
        hint="Образование, ученая степень, звание, опыт работы, публикации, патенты, опыт руководства НИР/НИОКР"
        value={data.head_of_project_qualification}
        onChange={(v) => onChange('head_of_project_qualification', v)}
      />

      <TextField
        id="date"
        label="Дата рождения"
        type="date"
        required
        value={data.date}
        onChange={(v) => onChange('date', v)}
      />
    </Section>
  );
}
