import Section from '../components/Section';
import type { FormData } from '../types/form';

interface PersonalDataProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function PersonalData({ data, onChange }: PersonalDataProps) {
  return (
    <Section title="Личные данные">
      <div className="two-column">
        <div className="form-group">
          <label htmlFor="head_of_project">Руководитель проекта (ФИО)</label>
          <input
            type="text"
            id="head_of_project"
            name="head_of_project"
            required
            placeholder="Фамилия Имя Отчество"
            value={data.head_of_project}
            onChange={(e) => onChange('head_of_project', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="head_of_np">Руководитель ОУП / НП (ФИО)</label>
          <input
            type="text"
            id="head_of_np"
            name="head_of_np"
            required
            placeholder="Фамилия Имя Отчество"
            value={data.head_of_np}
            onChange={(e) => onChange('head_of_np', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="head_of_project_qualifications">
          Квалификация руководителя проекта
        </label>
        <textarea
          id="head_of_project_qualifications"
          name="head_of_project_qualifications"
          placeholder="Образование, ученая степень, звание, опыт работы, публикации, патенты, опыт руководства НИР/НИОКР"
          value={data.head_of_project_qualifications}
          onChange={(e) => onChange('head_of_project_qualifications', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Дата</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={data.date}
          onChange={(e) => onChange('date', e.target.value)}
        />
      </div>
    </Section>
  );
}
