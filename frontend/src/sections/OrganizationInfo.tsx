import Section from '../components/Section';
import type { FormData } from '../types/form';

interface OrganizationInfoProps {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function OrganizationInfo({
  data,
  onChange,
}: OrganizationInfoProps) {
  return (
    <Section title="Информация об организации (для гарантийного письма)">
      <div className="form-group">
        <label htmlFor="organization_name">Наименование организации</label>
        <input
          type="text"
          id="organization_name"
          name="organization_name"
          placeholder="Полное название организации"
          value={data.organization_name}
          onChange={(e) => onChange('organization_name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="organization_info">Сведения об организации</label>
        <textarea
          id="organization_info"
          name="organization_info"
          placeholder="ИНН, ОГРН, КПП, юридический и почтовый адрес, телефон, деятельность в соответствии с ОКВЭД"
          value={data.organization_info}
          onChange={(e) => onChange('organization_info', e.target.value)}
        />
      </div>

      <div className="two-column">
        <div className="form-group">
          <label htmlFor="head_of_organization">Руководитель организации (ФИО)</label>
          <input
            type="text"
            id="head_of_organization"
            name="head_of_organization"
            placeholder="Фамилия Имя Отчество"
            value={data.head_of_organization}
            onChange={(e) => onChange('head_of_organization', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="main_accountant_of_organization">
            Главный бухгалтер организации (ФИО)
          </label>
          <input
            type="text"
            id="main_accountant_of_organization"
            name="main_accountant_of_organization"
            placeholder="Фамилия Имя Отчество"
            value={data.main_accountant_of_organization}
            onChange={(e) => onChange('main_accountant_of_organization', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="position">Должность</label>
        <input
          type="text"
          id="position"
          name="position"
          placeholder="Название должности"
          value={data.position}
          onChange={(e) => onChange('position', e.target.value)}
        />
      </div>
    </Section>
  );
}
