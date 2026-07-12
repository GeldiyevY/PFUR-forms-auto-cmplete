import type { GrantTypeId } from '../types/grantTypes';
import DocTypeSelector from './DocTypeSelector';

interface HeaderProps {
  selectedDocType: GrantTypeId;
  onDocTypeChange: (id: GrantTypeId) => void;
}

export default function Header({ selectedDocType, onDocTypeChange }: HeaderProps) {
  return (
    <div className="header">
      <h1>Генератор заявки на научный проект</h1>
      <DocTypeSelector selected={selectedDocType} onChange={onDocTypeChange} />
      <p>Заполните форму для автоматического создания документа заявки</p>
    </div>
  );
}
