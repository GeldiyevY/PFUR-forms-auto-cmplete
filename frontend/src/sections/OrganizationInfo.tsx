import Section from '../components/Section';
import TextField from '../components/TextField';
import TextAreaField from '../components/TextAreaField';
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
      <TextField
        id="organization_name"
        label="Наименование организации"
        hint="Полное название организации"
        value={data.organization_name}
        onChange={(v) => onChange('organization_name', v)}
      />

      <TextAreaField
        id="organization_info"
        label="Сведения об организации"
        hint="ИНН, ОГРН, КПП, юридический и почтовый адрес, телефон, деятельность в соответствии с ОКВЭД"
        value={data.organization_info}
        onChange={(v) => onChange('organization_info', v)}
      />

      <div className="two-column">
        <TextField
          id="head_of_organization"
          label="Руководитель организации (ФИО)"
          hint="Фамилия Имя Отчество"
          value={data.head_of_organization}
          onChange={(v) => onChange('head_of_organization', v)}
        />

        <TextField
          id="main_accountant_of_organization"
          label="Главный бухгалтер организации (ФИО)"
          hint="Фамилия Имя Отчество"
          value={data.main_accountant_of_organization}
          onChange={(v) => onChange('main_accountant_of_organization', v)}
        />
      </div>

      <TextField
        id="position"
        label="Должность"
        hint="Название должности"
        value={data.position}
        onChange={(v) => onChange('position', v)}
      />
    </Section>
  );
}
