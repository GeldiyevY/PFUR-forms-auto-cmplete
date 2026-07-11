import Section from '../components/Section';
import type { FormData } from '../types/form';

interface ProjectGeneralInfoProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function ProjectGeneralInfo({
  data,
  onChange,
  onCategoryChange,
}: ProjectGeneralInfoProps) {
  return (
    <Section title="Общая информация по проекту">
      <div className="form-group">
        <label htmlFor="project_name">Название проекта</label>
        <input
          type="text"
          id="project_name"
          name="project_name"
          required
          placeholder="Введите название научного проекта"
          value={data.project_name}
          onChange={(e) => onChange('project_name', e.target.value)}
        />
      </div>

      <div className="two-column">
        <div className="form-group">
          <label htmlFor="key_words">Ключевые слова</label>
          <input
            type="text"
            id="key_words"
            name="key_words"
            required
            placeholder="Ключевые слова через запятую"
            value={data.key_words}
            onChange={(e) => onChange('key_words', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sience_field">
            Область науки (OCED, Приоритетное направление СНТР, ГРНТИ)
          </label>
          <input
            type="text"
            id="sience_field"
            name="sience_field"
            required
            placeholder="Укажите область науки"
            value={data.sience_field}
            onChange={(e) => onChange('sience_field', e.target.value)}
          />
        </div>
      </div>

      <div className="two-column">
        <div className="form-group">
          <label htmlFor="research_direction">Направление исследования</label>
          <select
            id="research_direction"
            name="research_direction"
            required
            value={data.research_direction}
            onChange={(e) => onChange('research_direction', e.target.value)}
          >
            <option value="">Выберите направление</option>
            <option value="Прикладное">Прикладное</option>
            <option value="Фундаментальное">Фундаментальное</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="project_category">Категория проекта</label>
          <select
            id="project_category"
            name="project_category"
            required
            value={data.project_category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            <option value="А">А</option>
            <option value="Б">Б</option>
          </select>
        </div>
      </div>
    </Section>
  );
}
