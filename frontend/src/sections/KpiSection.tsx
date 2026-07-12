import Section from '../components/Section';
import KpiRow from '../components/KpiRow';
import type { KpiData } from '../types/form';

interface KpiSectionProps {
  data: KpiData;
  horizon: number;
  onChange: (kpeIndex: string, field: string, value: string | number) => void;
}

export default function KpiSection({ data, horizon, onChange }: KpiSectionProps) {
  const kpeList: { kpeId: keyof KpiData; title: string; stage1Label?: string; stage2Label?: string; stage3Label?: string }[] = [
    {
      kpeId: 'kpe1',
      title: 'КПЭ-1: Публикация статей в журналах WoS/Scopus',
      stage1Label: '1-й этап (статья)',
      stage2Label: '2-й этап (статья)',
      stage3Label: '3-й этап (статья) - только для категории А',
    },
    {
      kpeId: 'kpe2',
      title: 'КПЭ-2: Привлечение внешнего финансирования',
      stage1Label: '1-й этап (тыс. руб.)',
      stage2Label: '2-й этап (тыс. руб.)',
      stage3Label: '3-й этап (тыс. руб.) - только для категории А',
    },
    {
      kpeId: 'kpe3',
      title: 'КПЭ-3: Апробация результатов НИР/НИОКР на международных НТМ',
      stage1Label: '1-й этап (участие с публикацией)',
      stage2Label: '2-й этап (участие с публикацией)',
      stage3Label: '3-й этап (участие с публикацией) - только для категории А',
    },
    {
      kpeId: 'kpe4',
      title: 'КПЭ-4: Подача заявки на регистрацию РИД',
      stage1Label: '1-й этап (заявка на регистрацию)',
      stage2Label: '2-й этап (заявка на регистрацию)',
      stage3Label: '3-й этап (заявка на регистрацию) - только для категории А',
    },
    {
      kpeId: 'kpe5',
      title: 'КПЭ-5: Зарегистрированные РИД',
      stage1Label: '1-й этап (регистрация РИД)',
      stage2Label: '2-й этап (регистрация РИД)',
      stage3Label: '3-й этап (регистрация РИД) - только для категории А',
    },
    {
      kpeId: 'kpe6',
      title: 'КПЭ-6: Подготовка заявки на участие в следующем этапе Системы грантовой поддержки РУДН',
      stage1Label: '1-й этап (заявка)',
      stage2Label: '2-й этап (заявка)',
      stage3Label: '3-й этап (заявка) - только для категории А',
    },
    {
      kpeId: 'kpe7',
      title: 'КПЭ-7: Студенты и/или аспиранты в составе научного коллектива',
      stage1Label: '1-й этап (чел.)',
      stage2Label: '2-й этап (чел.)',
      stage3Label: '3-й этап (чел.) - только для категории А',
    },
  ];

  return (
    <Section title="КПЭ Форма 3 - Плановые ключевые показатели эффективности проекта">
      {kpeList.map((kpe) => (
        <KpiRow
          key={kpe.kpeId}
          title={kpe.title}
          data={data[kpe.kpeId]}
          horizon={horizon}
          stage1Label={kpe.stage1Label}
          stage2Label={kpe.stage2Label}
          stage3Label={kpe.stage3Label}
          onChange={(field, value) => onChange(kpe.kpeId, field, value)}
        />
      ))}
    </Section>
  );
}
