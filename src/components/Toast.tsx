interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

/**
 * Componente de notificación flotante (Toast).
 * Muestra alertas temporales de éxito o error con un diseño elegante.
 */
export function Toast({ message, type }: ToastProps) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <span>{type === 'success' ? '✅' : '❌'}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
