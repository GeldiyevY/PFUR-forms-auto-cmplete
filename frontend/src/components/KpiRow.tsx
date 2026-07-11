import type { KpiStageData } from '../types/form';

interface KpiRowProps {
  title: string;
  data: KpiStageData;
  isCategoryA: boolean;
  onChange: (field: keyof KpiStageData, value: string | number) => void;
  stage1Label?: string;
  stage2Label?: string;
  stage3Label?: string;
}

export default function KpiRow({
  title,
  data,
  isCategoryA,
  onChange,
  stage1Label = '1-й этап',
  stage2Label = '2-й этап',
  stage3Label = '3-й этап - только для категории А',
}: KpiRowProps) {
  return (
    <div className="form-group">
      <h3>{title}</h3>
      <div className="kpe-row">
        <div className="form-group">
          <label htmlFor="">{stage1Label}</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={data.stage1 || ''}
            onChange={(e) => onChange('stage1', e.target.value === '' ? 0 : parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">{stage2Label}</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={data.stage2 || ''}
            onChange={(e) => onChange('stage2', e.target.value === '' ? 0 : parseFloat(e.target.value))}
          />
        </div>
        <div className={`form-group${isCategoryA ? '' : ' category-a-only'}`}>
          {isCategoryA && <label htmlFor="">{stage3Label}</label>}
          {!isCategoryA && <label htmlFor="">{stage3Label}</label>}
          <input
            type="number"
            min="0"
            placeholder="0"
            value={data.stage3 || ''}
            onChange={(e) => onChange('stage3', e.target.value === '' ? 0 : parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Комментарий руководителя</label>
          <textarea
            placeholder="Комментарий к КПЭ"
            value={data.comment}
            onChange={(e) => onChange('comment', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
