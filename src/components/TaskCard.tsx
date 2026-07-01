import { useState } from 'react';
import type { Task } from '../types/task.types';
import { DateInput } from './DateInput';

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  onUpdateTask: (taskId: string, updatedFields: Partial<Task>) => Promise<void>;
  onToggleStatus: () => void;
  onDeleteClick: () => void;
}

/**
 * Componente de Tarjeta de Tarea individual (TaskCard).
 * Administra internamente el estado de edición local de los campos de entrada
 * y delega las operaciones asíncronas de base de datos a través de props.
 */
export function TaskCard({
  task,
  isEditing,
  onEditClick,
  onCancelClick,
  onUpdateTask,
  onToggleStatus,
  onDeleteClick
}: TaskCardProps) {
  // Estados de edición locales
  const [editTitle, setEditTitle] = useState<string>(task.title);
  const [editDescription, setEditDescription] = useState<string>(task.description || '');
  const [editPriority, setEditPriority] = useState<'alta' | 'media' | 'baja'>(task.priority || 'media');
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate || new Date().toISOString().split('T')[0]);
  const [editAssignedArea, setEditAssignedArea] = useState<'desarrollo' | 'diseño' | 'marketing' | 'soporte'>(
    task.assignedArea || 'desarrollo'
  );

  // Rastreador del estado previo para ajustar la edición durante el renderizado
  const [prevIsEditing, setPrevIsEditing] = useState<boolean>(isEditing);

  if (isEditing !== prevIsEditing) {
    setPrevIsEditing(isEditing);
    if (isEditing) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditPriority(task.priority || 'media');
      setEditDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setEditAssignedArea(task.assignedArea || 'desarrollo');
    }
  }

  const handleSave = async () => {
    await onUpdateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      dueDate: editDueDate,
      assignedArea: editAssignedArea
    });
  };

  const isHighPriority = task.priority === 'alta';
  const cardClass = `task-card ${isEditing ? 'task-card-edit-mode' : ''} ${
    isHighPriority && !task.completed ? 'priority-alta' : ''
  }`;

  return (
    <div className={cardClass}>
      {isEditing ? (
        <div className="task-edit-container" style={{ width: '100%' }}>
          <div className="task-edit-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Título</label>
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título de la tarea"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Descripción</label>
              <input
                type="text"
                className="form-input"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción (opcional)"
              />
            </div>
            
            <div className="task-form-row form-meta-row" style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Prioridad</label>
                <select
                  className="form-input form-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'alta' | 'media' | 'baja')}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Vencimiento</label>
                <DateInput
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Área</label>
                <select
                  className="form-input form-select"
                  value={editAssignedArea}
                  onChange={(e) => setEditAssignedArea(e.target.value as 'desarrollo' | 'diseño' | 'marketing' | 'soporte')}
                >
                  <option value="desarrollo">Desarrollo</option>
                  <option value="diseño">Diseño</option>
                  <option value="marketing">Marketing</option>
                  <option value="soporte">Soporte</option>
                </select>
              </div>
            </div>
          </div>
          <div className="task-actions edit-mode-actions" style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleSave} 
              className="auth-button" 
              style={{ marginTop: 0, width: 'auto', paddingInline: '16px', fontSize: '13px' }}
            >
              Guardar
            </button>
            <button 
              onClick={onCancelClick} 
              className="auth-button-secondary" 
              style={{ marginTop: 0, width: 'auto', paddingInline: '16px', fontSize: '13px' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-details">
            <div className="task-checkbox-container">
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onChange={onToggleStatus}
              />
            </div>
            <div className="task-text">
              <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`task-desc ${task.completed ? 'completed' : ''}`}>
                  {task.description}
                </p>
              )}

              {/* Badges de metadatos avanzadas */}
              <div className="task-badges">
                <span className={`badge badge-priority-${task.priority || 'media'}`}>
                  ⚡ {task.priority ? task.priority.toUpperCase() : 'MEDIA'}
                </span>
                <span className="badge badge-area">
                  📂 {task.assignedArea ? task.assignedArea.toUpperCase() : 'DESARROLLO'}
                </span>
                {task.dueDate && (
                  <span className="badge badge-date">
                    📅 {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="task-actions">
            <button 
              onClick={onEditClick} 
              className="edit-task-button"
              style={{ marginRight: '8px' }}
            >
              Editar
            </button>
            <button onClick={onDeleteClick} className="delete-task-button">
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
