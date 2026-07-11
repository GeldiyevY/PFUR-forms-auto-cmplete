import type { AlertType } from '../types/form';

interface StatusAlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

export default function StatusAlert({ type, message, onClose }: StatusAlertProps) {
  if (!message) return null;

  const className =
    type === 'error'
      ? 'alert alert-danger'
      : type === 'success'
        ? 'alert alert-success'
        : 'alert alert-info';

  return (
    <div className={className} style={{ display: 'block' }}>
      {message}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
