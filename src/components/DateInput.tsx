import type { InputHTMLAttributes } from 'react';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id?: string;
}

/**
 * Componente de entrada de fecha personalizado.
 * Envuelve un input nativo de tipo 'date' con un icono de calendario emoji
 * absoluto que actúa como desencadenador del selector interactivo nativo.
 */
export function DateInput({ id, style, ...props }: DateInputProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        type="date"
        className="form-input"
        style={{ paddingRight: '36px', ...style }}
        {...props}
      />
      <span
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: '14px',
          zIndex: 3
        }}
      >
        📅
      </span>
    </div>
  );
}
