import { useState } from 'react';
import type { FormEvent } from 'react';
import { DateInput } from './DateInput';

interface TaskFormProps {
  onCreateTask: (taskData: {
    title: string;
    description: string;
    priority: 'alta' | 'media' | 'baja';
    dueDate: string;
    assignedArea: 'desarrollo' | 'diseño' | 'marketing' | 'soporte';
  }) => Promise<void>;
  error: string | null;
}

/**
 * Componente del Formulario de Creación de Tareas.
 * Encapsula internamente el estado de todos sus campos de entrada
 * y emite los datos hacia el componente contenedor mediante 'onCreateTask'.
 */
export function TaskForm({ onCreateTask, error }: TaskFormProps) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [dueDate, setDueDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [assignedArea, setAssignedArea] = useState<'desarrollo' | 'diseño' | 'marketing' | 'soporte'>('desarrollo');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      assignedArea
    });

    // Resetear formulario tras una inserción exitosa
    setTitle('');
    setDescription('');
    setPriority('media');
    setDueDate(new Date().toISOString().split('T')[0]);
    setAssignedArea('desarrollo');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {error && <div className="error-message" style={{ marginBottom: '12px' }}>{error}</div>}
      
      {/* Fila 1: Título y Descripción */}
      <div className="task-form-row">
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la tarea"
            required
          />
        </div>
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
          />
        </div>
      </div>

      {/* Fila 2: Propiedades (Prioridad, Fecha, Área) y Botón */}
      <div className="task-form-row form-meta-row" style={{ marginTop: '12px' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label-inline" htmlFor="priority">Prioridad:</label>
          <select
            id="priority"
            className="form-input form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'alta' | 'media' | 'baja')}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label-inline" htmlFor="dueDate">Vencimiento:</label>
          <DateInput
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label-inline" htmlFor="assignedArea">Área:</label>
          <select
            id="assignedArea"
            className="form-input form-select"
            value={assignedArea}
            onChange={(e) => setAssignedArea(e.target.value as 'desarrollo' | 'diseño' | 'marketing' | 'soporte')}
          >
            <option value="desarrollo">Desarrollo</option>
            <option value="diseño">Diseño</option>
            <option value="marketing">Marketing</option>
            <option value="soporte">Soporte</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 0 }}>
          <button type="submit" className="auth-button" style={{ marginTop: 0, width: '100%', paddingInline: '24px', height: '45px' }}>
            Agregar
          </button>
        </div>
      </div>
    </form>
  );
}
