interface ButtonContainerProps {
  onTestFill: () => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export default function ButtonContainer({
  onTestFill,
  onGenerate,
  disabled,
}: ButtonContainerProps) {
  return (
    <div className="button-container">
      <button type="button" className="test-btn" onClick={onTestFill}>
        🧪 Тестовые данные
      </button>
      <button
        type="button"
        className="submit-btn"
        onClick={onGenerate}
        disabled={disabled}
      >
        🚀 Создать документ заявки
      </button>
    </div>
  );
}
