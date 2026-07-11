import Section from '../components/Section';
import CharCounterTextarea from '../components/CharCounterTextarea';
import type { FormData } from '../types/form';

interface ProjectDescriptionProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function ProjectDescription({
  data,
  onChange,
}: ProjectDescriptionProps) {
  const fields: {
    id: keyof FormData;
    label: string;
    maxLength: number;
    placeholder: string;
  }[] = [
    {
      id: 'project_annotation',
      label: 'Аннотация проекта',
      maxLength: 500,
      placeholder: 'Краткое описание проекта (до 500 символов)',
    },
    {
      id: 'project_goal',
      label: 'Цель проекта',
      maxLength: 500,
      placeholder: 'Цель проекта (не более 500 символов)',
    },
    {
      id: 'project_tasks',
      label: 'Задачи проекта',
      maxLength: 500,
      placeholder: 'Задачи проекта (не более 500 символов)',
    },
    {
      id: 'research_description',
      label: 'Описание научного исследования',
      maxLength: 10000,
      placeholder:
        'Подробное описание исследования: актуальность, адекватность современному состоянию науки, возможность получения новых результатов (не более 10000 символов)',
    },
    {
      id: 'scientific_methods_description',
      label: 'Описание научных подходов и методов',
      maxLength: 5000,
      placeholder:
        'Описание методов для решения поставленных задач (не более 5000 символов)',
    },
    {
      id: 'project_background_description',
      label: 'Научный задел по проекту',
      maxLength: 5000,
      placeholder:
        'Описание научного задела и связанных результатов, включая литературные источники (не более 5000 символов)',
    },
    {
      id: 'expected_results',
      label: 'Ожидаемые результаты научного исследования',
      maxLength: 5000,
      placeholder:
        'Планируемые конкретные научные результаты с разделением по этапам (не более 5000 символов)',
    },
    {
      id: 'content_of_work',
      label: 'Состав и содержание работ по проекту',
      maxLength: 5000,
      placeholder:
        'Описание плана работ и обоснование финансирования (не более 5000 символов)',
    },
  ];

  return (
    <Section title="Описание проекта">
      <div className="form-group">
        <label htmlFor="project_objective">Объект проекта (для Формы 2)</label>
        <input
          type="text"
          id="project_objective"
          name="project_objective"
          placeholder="Укажите объект исследования"
          value={data.project_objective}
          onChange={(e) => onChange('project_objective', e.target.value)}
        />
      </div>

      {fields.map((f) => (
        <CharCounterTextarea
          key={f.id}
          id={f.id}
          label={f.label}
          maxLength={f.maxLength}
          placeholder={f.placeholder}
          value={data[f.id]}
          onChange={(v) => onChange(f.id, v)}
          required={f.id === 'project_annotation'}
        />
      ))}

      <div className="form-group">
        <label htmlFor="equipment">Требуемое оборудование и материалы</label>
        <textarea
          id="equipment"
          name="equipment"
          placeholder="Перечень оборудования с ориентировочной стоимостью и планом закупки"
          value={data.equipment}
          onChange={(e) => onChange('equipment', e.target.value)}
        />
      </div>
    </Section>
  );
}
