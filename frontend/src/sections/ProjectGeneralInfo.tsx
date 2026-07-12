import Section from '../components/Section';
import TextField from '../components/TextField';
import type { FormData } from '../types/form';
import type { GrantType } from '../types/grantTypes';

interface ProjectGeneralInfoProps {
  data: FormData;
  grantType: GrantType;
  onChange: (field: keyof FormData, value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function ProjectGeneralInfo({
  data,
  grantType,
  onChange,
  onCategoryChange,
}: ProjectGeneralInfoProps) {
  const categories = grantType.categoryConfigs;

  return (
    <Section title="Общая информация по проекту">
      <TextField
        id="project_name"
        label="Название проекта"
        required
        hint="Введите название научного проекта"
        value={data.project_name}
        onChange={(v) => onChange('project_name', v)}
      />

      <div className="two-column">
        <TextField
          id="key_words"
          label="Ключевые слова"
          required
          hint="Ключевые слова через запятую"
          value={data.key_words}
          onChange={(v) => onChange('key_words', v)}
        />

        <TextField
          id="science_field"
          label="Область науки (OCED, Приоритетное направление СНТР, ГРНТИ)"
          required
          hint="Укажите область науки"
          value={data.science_field}
          onChange={(v) => onChange('science_field', v)}
        />
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

        {categories.length > 1 && (
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
              {categories.map((cat) => (
                <option key={cat.value} value={cat.label}>
                  {cat.label} (до {cat.workPlanHorizon} лет)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Section>
  );
}
