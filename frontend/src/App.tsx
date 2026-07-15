import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import StatusAlert from './components/StatusAlert';
import ButtonContainer from './components/ButtonContainer';
import { useTemplate } from './hooks/useTemplate';
import { useDocumentGenerator } from './hooks/useDocumentGenerator';
import { GrantType } from './grantTypes/GrantType';
import { GrantTypeR1 } from './grantTypes/GrantTypeR1';
import { GrantTypeD1 } from './grantTypes/GrantTypeD1';
import { GrantTypeD2 } from './grantTypes/GrantTypeD2';
import { Category } from './categories/Category';
import { CategoryNone } from './categories/CategoryNone';
import type { ElementRegistry } from './categories/Category';
import { CategorySelector } from './uielements/CategorySelector';
import type { UIElement } from './uielements/UIElement';
import { formatDate } from './utils/formatDate';
import type { AlertType } from './types/form';
import './App.css';

const grantTypes: GrantType[] = [
  new GrantTypeR1(),
  new GrantTypeD1(),
  new GrantTypeD2(),
];

export default function App() {
  const { buffer: templateBuffer, loading: templateLoading, error: templateError, loadTemplate } = useTemplate();
  const { generate } = useDocumentGenerator();

  const [selected, setSelected] = useState<GrantType | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categorySelector = useMemo(
    () =>
      selected
        ? (selected
            .getForms()
            .flat()
            .find((el) => el instanceof CategorySelector) as CategorySelector | undefined)
        : undefined,
    [selected],
  );

  const registry = useMemo<ElementRegistry | null>(() => {
    if (!selected) return null;
    const map: Record<string, UIElement> = {};
    for (const form of selected.getForms()) {
      for (const el of form) map[el.id] = el;
    }
    return {
      get<T extends UIElement>(id: string) {
        return map[id] as T | undefined;
      },
      all() {
        return Object.values(map);
      },
    };
  }, [selected]);

  const [appliedCategory, setAppliedCategory] = useState<Category>(new CategoryNone());

  useEffect(() => {
    setAppliedCategory(new CategoryNone());
  }, [selected]);

  useEffect(() => {
    if (!registry) return;
    const code = values['project_category'] || '';
    const next = categorySelector?.categories.find((c) => c.code === code) ?? new CategoryNone();
    if (next.code !== appliedCategory.code) {
      appliedCategory.onDeselect(registry);
      next.onSelect(registry);
      setAppliedCategory(next);
    }
  }, [values['project_category'], categorySelector, registry, appliedCategory]);

  const category: Category = appliedCategory;

  useEffect(() => {
    if (templateError) {
      setAlert({ type: 'error', message: templateError });
    }
  }, [templateError]);

  const handleSelect = useCallback((gt: GrantType) => {
    setSelected(gt);
    setValues({});
    setAlert(null);
    loadTemplate(gt.templateName);
  }, [loadTemplate]);

  const updateField = useCallback((id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selected) return;
    if (!templateBuffer) {
      setAlert({ type: 'error', message: 'Шаблон не загружен. Перезагрузите страницу.' });
      return;
    }

    setIsLoading(true);
    setAlert({ type: 'error', message: '' });

    try {
      const payload = selected.collect(values);
      payload['date'] = formatDate(String(payload['date'] ?? ''));
      await generate({ templateBuffer, payload, templateName: selected.templateName });
      const name = values['project_name'] || 'заявка';
      setAlert({ type: 'success', message: `Документ "Заявка ${name}.docx" успешно создан и скачан!` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка создания документа';
      setAlert({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [selected, templateBuffer, values, generate]);

  const fillTestData = useCallback(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    selected.fillTest({ setValue: (id, value) => { next[id] = value; } });
    setValues(next);
  }, [selected]);

  const forms = useMemo(() => (selected ? selected.getForms() : []), [selected]);
  const titles = useMemo(() => (selected ? selected.formTitles : []), [selected]);
  const hasForms = useMemo(() => forms.some((f) => f.length > 0), [forms]);

  return (
    <>
      <div className="container">
        <div className={selected ? 'header header--top' : 'header header--center'}>
          <h1>Генератор заявки на научный проект</h1>
          <p>Выберите тип гранта и заполните форму для автоматического создания документа заявки</p>
          <div className="chips">
            {grantTypes.map((gt) => (
              <button
                key={gt.name}
                type="button"
                className={`chip${selected === gt ? ' active' : ''}`}
                onClick={() => handleSelect(gt)}
              >
                {gt.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-container">
          {selected && (
            <>
              <div className="status-messages">
                {templateLoading && (
                  <div className="alert alert-info loading" style={{ display: 'flex' }}>
                    <div className="spinner" />
                    <div id="loading-text">Загружается шаблон...</div>
                  </div>
                )}
                {alert && <StatusAlert type={alert.type} message={alert.message} />}
              </div>

              {hasForms && (
                <form id="document-form">
                  {forms.map((form, fi) => (
                    <div className="form-card" key={`form-${fi}`}>
                      <h2 className="form-card-title">{titles[fi]}</h2>
                      {form.map((el) => (
                        <Fragment key={el.id}>
                          {el.draw({
                            value: values[el.id] ?? '',
                            onChange: (v) => updateField(el.id, v),
                            category,
                            values,
                          })}
                        </Fragment>
                      ))}
                    </div>
                  ))}

                  <ButtonContainer
                    onTestFill={fillTestData}
                    onGenerate={handleGenerate}
                    disabled={isLoading || templateLoading}
                  />
                </form>
              )}

              {!hasForms && (
                <div className="empty-state">
                  Для типа гранта <strong>{selected.name}</strong> формы пока не определены.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
