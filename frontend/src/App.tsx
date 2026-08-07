import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import StatusAlert from "./components/StatusAlert";
import ButtonContainer from "./components/ButtonContainer";
import { useTemplate } from "./hooks/useTemplate";
import { useDocumentGenerator } from "./hooks/useDocumentGenerator";
import { GrantType } from "./grantTypes/GrantType";
import { GrantTypeR1 } from "./grantTypes/GrantTypeR1";
import { GrantTypeD1 } from "./grantTypes/GrantTypeD1";
import { GrantTypeD2 } from "./grantTypes/GrantTypeD2";
import { Category } from "./categories/Category";
import { CategoryNone } from "./categories/CategoryNone";
import type { ElementRegistry } from "./categories/Category";
import { CategorySelector } from "./uielements/CategorySelector";
import type { UIElement } from "./uielements/UIElement";
import type { Direction } from "./direction/Direction";
import { DirectionNone } from "./direction/DirectionNone";
import { formatDate } from "./utils/formatDate";
import type { AlertType } from "./types/form";
import "./App.css";
import { GrantTypeApplicationD } from "./grantTypes/GrantTypeApplicationD";

const grantTypes: GrantType[] = [
  new GrantTypeR1(),
  new GrantTypeD1(),
  new GrantTypeD2(),
  new GrantTypeApplicationD(),
];

export default function App() {
  const { loadTemplates, checkForUpdates } = useTemplate();
  const { generate } = useDocumentGenerator();

  const [templateBuffers, setTemplateBuffers] = useState<Uint8Array[] | null>(
    null,
  );
  const [buffersLoading, setBuffersLoading] = useState(false);

  const [selected, setSelected] = useState<GrantType | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categorySelector = useMemo(
    () =>
      selected
        ? (selected
            .getForms()
            .flat()
            .find((el) => el instanceof CategorySelector) as
            | CategorySelector
            | undefined)
        : undefined,
    [selected],
  );

  const directionField = useMemo(
    () => (selected ? (selected.directionField ?? null) : null),
    [selected],
  );

  const registry = useMemo<ElementRegistry | null>(() => {
    if (!selected) return null;
    const map: Record<string, UIElement> = {};
    for (const form of selected.getForms()) {
      for (const el of form) map[el.id] = el;
    }
    if (directionField) map[directionField.id] = directionField;
    return {
      get<T extends UIElement>(id: string) {
        return map[id] as T | undefined;
      },
      all() {
        return Object.values(map);
      },
    };
  }, [selected, directionField]);

  const [appliedCategory, setAppliedCategory] = useState<Category>(
    new CategoryNone(),
  );

  useEffect(() => {
    // Grant type switched: discard the previous grant type's restriction
    // snapshot so its onDeselect (which runs below with the old applied value
    // against the NEW element registry) does NOT restore stale intrinsic
    // fields such as KpiElement.grantType / BudgetElement.grantType (and
    // horizon, minPoints, etc.) onto the new grant type's elements.
    appliedCategory.clearSaved();
    setAppliedCategory(new CategoryNone());
  }, [selected]);

  useEffect(() => {
    if (!registry) return;
    const code = values["project_category"] || "";
    const next =
      categorySelector?.categories.find((c) => c.code === code) ??
      new CategoryNone();
    if (next.code !== appliedCategory.code) {
      appliedCategory.onDeselect(registry);
      next.onSelect(registry);
      setAppliedCategory(next);
    }
  }, [values["project_category"], categorySelector, registry, appliedCategory]);

  const category: Category = appliedCategory;

  const [appliedDirection, setAppliedDirection] = useState<Direction>(
    new DirectionNone(),
  );

  useEffect(() => {
    // See comment in the category reset effect above.
    appliedDirection.clearSaved();
    setAppliedDirection(new DirectionNone());
  }, [selected]);

  useEffect(() => {
    if (!registry) return;
    const code = values["project_direction"] || "";
    const next =
      selected?.directions.find((d) => d.code === code) ?? new DirectionNone();
    if (next.code !== appliedDirection.code) {
      appliedDirection.onDeselect(registry);
      next.onSelect(registry);
      setAppliedDirection(next);
    }
  }, [values["project_direction"], selected, registry, appliedDirection]);

  // --- On mount: silently refresh all cached templates in the background ---
  useEffect(() => {
    const names: string[] = [];
    for (const gt of grantTypes) {
      if (gt.templateName) names.push(gt.templateName);
      if (gt.applicationName) names.push(gt.applicationName);
    }
    const unique = [...new Set(names)];
    void checkForUpdates(unique);
  }, [checkForUpdates]);

  const handleSelect = useCallback(
    (gt: GrantType) => {
      setSelected(gt);
      setValues({});
      setAlert(null);
      setTemplateBuffers(null);
      setBuffersLoading(true);

      // Load whichever templates are configured. templateName (if set) stays first
      // so it becomes the primary document; applicationName is appended after it.
      const names: string[] = [];
      if (gt.templateName) names.push(gt.templateName);
      if (gt.application && gt.application.length > 0 && gt.applicationName) {
        names.push(gt.applicationName);
      }
      if (names.length === 0) {
        // Nothing to load — generation is fully disabled; the config error (if any)
        // is shown by the top banner.
        setBuffersLoading(false);
        return;
      }

      loadTemplates(names)
        .then((buffers) => setTemplateBuffers(buffers))
        .catch((err) =>
          setAlert({
            type: "error",
            message:
              err instanceof Error ? err.message : "Ошибка загрузки шаблона",
          }),
        )
        .finally(() => setBuffersLoading(false));
    },
    [loadTemplates],
  );

  const updateField = useCallback((id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selected) return;
    if (!templateBuffers || templateBuffers.length === 0) {
      setAlert({
        type: "error",
        message: "Шаблон не загружен. Перезагрузите страницу.",
      });
      return;
    }

    setIsLoading(true);
    setAlert({ type: "error", message: "" });

    try {
      const payload = selected.collect(values, category);
      payload["date"] = formatDate(String(payload["date"] ?? ""));
      await generate({
        templateBuffers,
        payload,
        templateName: selected.templateName,
      });
      const name = values["project_name"] || "заявка";
      setAlert({
        type: "success",
        message: `Документ "Заявка ${name}.docx" успешно создан и скачан!`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка создания документа";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [selected, templateBuffers, values, category, generate]);

  const fillTestData = useCallback(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    selected.fillTest({
      setValue: (id, value) => {
        next[id] = value;
      },
    });
    setValues(next);
  }, [selected]);

  const forms = useMemo(
    () => (selected ? selected.getForms() : []),
    [selected],
  );
  const hasForms = useMemo(() => forms.some((f) => f.length > 0), [forms]);

  const configErrors = useMemo(
    () => (selected ? selected.getErrors() : []),
    [selected],
  );

  // Pair each rendered form with its title. form1..form4 map to formTitles[0..3];
  // the application form (if present) uses applicationTitle; the guarantee letter
  // uses the last formTitles entry.
  const formCards = useMemo(() => {
    if (!selected) return [] as { form: UIElement[]; title: string }[];
    const cardDefs: { form: UIElement[] | null | undefined; title: string }[] =
      [
        { form: selected.form1, title: selected.formTitles[0] ?? "" },
        { form: selected.form2, title: selected.formTitles[1] ?? "" },
        { form: selected.form3, title: selected.formTitles[2] ?? "" },
        { form: selected.form4, title: selected.formTitles[3] ?? "" },
      ];
    const cards: { form: UIElement[]; title: string }[] = cardDefs
      .filter((c) => c.form && c.form.length > 0)
      .map((c) => ({ form: c.form as UIElement[], title: c.title }));
    if (selected.application && selected.application.length > 0) {
      cards.push({
        form: selected.application,
        title: selected.applicationTitle ?? "",
      });
    }
    if (selected.guaranteeLetter && selected.guaranteeLetter.length > 0) {
      cards.push({
        form: selected.guaranteeLetter,
        title:
          selected.formTitles[4] ??
          selected.formTitles[selected.formTitles.length - 1] ??
          "",
      });
    }
    return cards;
  }, [selected]);

  return (
    <>
      <div className="container">
        <div
          className={selected ? "header header--top" : "header header--center"}
        >
          <h1>Генератор заявки на научный проект</h1>
          <p>
            Выберите тип гранта и заполните форму для автоматического создания
            документа заявки
          </p>
          <div className="chips">
            {grantTypes.map((gt) => (
              <button
                key={gt.name}
                type="button"
                className={`chip${selected === gt ? " active" : ""}`}
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
                {buffersLoading && (
                  <div
                    className="alert alert-info loading"
                    style={{ display: "flex" }}
                  >
                    <div className="spinner" />
                    <div id="loading-text">Загружается шаблон...</div>
                  </div>
                )}
                {configErrors.map((msg) => (
                  <StatusAlert key={msg} type="error" message={msg} />
                ))}
                {alert && (
                  <StatusAlert type={alert.type} message={alert.message} />
                )}
              </div>

              {hasForms && (
                <form id="document-form">
                  {formCards.map((card, fi) => (
                    <Fragment key={`form-${fi}`}>
                      <div className="form-card">
                        <h2 className="form-card-title">{card.title}</h2>
                        {card.form.map((el) => (
                          <Fragment key={el.id}>
                            {el.isVisible({
                              value: values[el.id] ?? "",
                              onChange: (v) => updateField(el.id, v),
                              category,
                              values,
                            }) &&
                              el.draw({
                                value: values[el.id] ?? "",
                                onChange: (v) => updateField(el.id, v),
                                category,
                                values,
                              })}
                          </Fragment>
                        ))}
                      </div>

                      {fi === 1 && directionField && (
                        <div className="form-card" key="direction">
                          {directionField.draw({
                            value: values[directionField.id] ?? "",
                            onChange: (v) => updateField(directionField.id, v),
                            category,
                            values,
                          })}
                        </div>
                      )}
                    </Fragment>
                  ))}

                  <ButtonContainer
                    onTestFill={fillTestData}
                    onGenerate={handleGenerate}
                    disabled={
                      isLoading || buffersLoading || configErrors.length > 0
                    }
                  />
                </form>
              )}

              {!hasForms && (
                <div className="empty-state">
                  Для типа гранта <strong>{selected.name}</strong> формы пока не
                  определены.
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="footer">
        Создано{" "}
        <a
          href="https://github.com/GeldiyevY"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Yhlas Geldiyev
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/SealDogg"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Yaroslav Merkulov
        </a>{" "}
        . Нажмите если нашли баг или нужно сделать сайт или приложение?
      </footer>
    </>
  );
}
