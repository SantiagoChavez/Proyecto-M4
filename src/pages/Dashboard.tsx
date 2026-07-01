import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getTasksByUser, 
  createTask, 
  toggleTaskStatus, 
  deleteTask,
  updateTask
} from '../services/taskService';
import type { Task } from '../types/task.types';

/**
 * Panel de control principal (Dashboard) para gestionar tareas en tiempo real.
 */
export const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Estados para las tareas y el formulario
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [dueDate, setDueDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [assignedArea, setAssignedArea] = useState<'desarrollo' | 'diseño' | 'marketing' | 'soporte'>('desarrollo');

  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el flujo de envío de correos
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Estados para la edición de tareas
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPriority, setEditPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editAssignedArea, setEditAssignedArea] = useState<'desarrollo' | 'diseño' | 'marketing' | 'soporte'>('desarrollo');

  // Filtros dinámicos
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Sistema de Notificaciones Toast nativo
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-cierre del Toast después de 3 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const uid = user?.uid;

  // Escuchar tareas en tiempo real asociadas al usuario autenticado
  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setTasks([]);
      }, 0);
      return;
    }

    const unsubscribe = getTasksByUser(
      uid, 
      (loadedTasks) => {
        setTasks(loadedTasks);
        setLoadingTasks(false);
      },
      (err) => {
        console.error('Error al suscribir tareas:', err);
        setError('Error al sincronizar las tareas desde el servidor.');
        setLoadingTasks(false);
      }
    );

    // Limpieza al desmontar
    return () => unsubscribe();
  }, [uid]);

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Crear una nueva tarea
  const handleCreateTask = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título de la tarea es requerido.');
      return;
    }

    if (!user) return;

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        completed: false,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        priority,
        dueDate,
        assignedArea
      });
      setTitle('');
      setDescription('');
      setPriority('media');
      setDueDate(new Date().toISOString().split('T')[0]);
      setAssignedArea('desarrollo');
      setToast({ message: '¡Tarea creada con éxito!', type: 'success' });
    } catch (err: unknown) {
      console.error('Error al crear tarea:', err);
      setError('No se pudo crear la tarea. Intente de nuevo.');
      setToast({ message: 'Error al crear la tarea', type: 'error' });
    }
  };

  // Cambiar el estado completado de una tarea
  const handleToggleStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTaskStatus(taskId, currentStatus);
      setToast({ 
        message: `Tarea marcada como ${!currentStatus ? 'completada' : 'pendiente'}`, 
        type: 'success' 
      });
    } catch (err: unknown) {
      console.error('Error al actualizar tarea:', err);
      setToast({ message: 'Error al actualizar la tarea', type: 'error' });
    }
  };

  // Eliminar una tarea por ID
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setToast({ message: 'Tarea eliminada con éxito', type: 'success' });
    } catch (err: unknown) {
      console.error('Error al eliminar tarea:', err);
      setToast({ message: 'Error al eliminar la tarea', type: 'error' });
    }
  };

  // Activar el modo de edición de una tarea
  const handleEditClick = (task: Task) => {
    setError(null);
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'media');
    setEditDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setEditAssignedArea(task.assignedArea || 'desarrollo');
  };

  // Guardar cambios de una tarea editada
  const handleUpdateTask = async (taskId: string) => {
    setError(null);

    if (!editTitle.trim()) {
      setError('El título de la tarea es requerido.');
      return;
    }

    setEditingTaskId(null);

    try {
      await updateTask(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate,
        assignedArea: editAssignedArea
      });
      setToast({ message: 'Tarea actualizada correctamente', type: 'success' });
      setEditTitle('');
      setEditDescription('');
      setEditPriority('media');
      setEditDueDate('');
      setEditAssignedArea('desarrollo');
    } catch (err: unknown) {
      console.error('Error al actualizar la tarea:', err);
      setError('No se pudo actualizar la tarea. Intente de nuevo.');
      setToast({ message: 'Error al actualizar la tarea', type: 'error' });
    }
  };

  // Formatear y enviar el reporte de tareas por correo
  const handleSendEmailReport = async () => {
    if (!user?.email) {
      const msg = 'No hay un correo electrónico asociado a la cuenta de usuario.';
      setEmailError(msg);
      setTimeout(() => {
        setEmailError(null);
      }, 4000);
      return;
    }

    setEmailLoading(true);
    setEmailSuccess(false);
    setEmailError(null);

    // Formatear lista de tareas en texto plano (español)
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const taskListText = tasks
      .map(t => `- [${t.completed ? 'COMPLETADA' : 'PENDIENTE'}] ${t.title}${t.description ? ` (${t.description})` : ''} [Prioridad: ${t.priority || 'media'}, Vence: ${t.dueDate || 'N/A'}, Área: ${t.assignedArea || 'N/A'}]`)
      .join('\n');

    const message = `Hola,\n\nEste es el reporte de estado de tus tareas diarias:\n\nResumen:\n- Total: ${totalTasks}\n- Completadas: ${completedTasks}\n- Pendientes: ${pendingTasks}\n\nDetalle de las tareas:\n${taskListText || '(No tienes tareas registradas)'}\n\nSaludos,\nGestor de Tareas.`;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Resumen de Tareas Pendientes',
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: Estado ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
      }

      setEmailSuccess(true);
      setToast({ message: '¡Reporte enviado por correo con éxito!', type: 'success' });
    } catch (err: unknown) {
      console.error('Error en el reporte de correos:', err);
      const msg = err instanceof Error ? err.message : 'Error al enviar el reporte por correo.';
      setEmailError(msg);
      setToast({ message: 'Error al enviar el reporte por correo', type: 'error' });
      setTimeout(() => {
        setEmailError(null);
      }, 4000);
    } finally {
      setEmailLoading(false);
    }
  };

  // Filtrar tareas en memoria
  const rawFilteredTasks = filter === 'pending'
    ? tasks.filter(t => !t.completed)
    : filter === 'completed'
    ? tasks.filter(t => t.completed)
    : tasks;

  // Ordenar por prioridad (alta > media > baja) y luego por fecha de creación (más antigua primero) para todas y pendientes
  const filteredTasks = (filter === 'all' || filter === 'pending')
    ? [...rawFilteredTasks].sort((a, b) => {
        const priorityWeight = { alta: 3, media: 2, baja: 1 };
        const weightA = priorityWeight[a.priority || 'media'];
        const weightB = priorityWeight[b.priority || 'media'];

        if (weightA !== weightB) {
          return weightB - weightA; // Prioridad más alta primero
        }

        // Si la prioridad es igual, se ubica primero la de fecha de creación más vieja (orden ascendente)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      })
    : rawFilteredTasks;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-logo">Gestor de Tareas</h1>
        <div className="dashboard-user-info">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2 className="welcome-title">Mis Tareas</h2>
        <p className="welcome-subtitle">Crea y administra tus pendientes con sincronización en la nube.</p>

        {/* Sección de Notificaciones de Reporte por Correo */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={handleSendEmailReport} 
            className="auth-button-secondary" 
            style={{ width: 'auto', display: 'inline-flex', marginTop: 0 }}
            disabled={emailLoading}
          >
            {emailLoading ? 'Preparando envío...' : 'Enviar reporte de tareas por correo'}
          </button>
          
          {emailLoading && <p className="email-status email-loading">Enviando reporte por correo...</p>}
          {emailSuccess && <p className="email-status email-success">¡Reporte enviado con éxito!</p>}
          {emailError && <p className="email-status email-error">{emailError}</p>}
        </div>

        {/* Formulario de creación de tareas */}
        <form onSubmit={handleCreateTask} className="task-form">
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
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="dueDate"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ paddingRight: '36px' }}
                  required
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    fontSize: '16px' 
                  }}
                >
                  📅
                </span>
              </div>
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

        {/* Listado de tareas */}
        {loadingTasks ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>
            <p>Cargando tareas en tiempo real...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="tasks-container-mock">
            <span className="mock-icon" aria-hidden="true">📋</span>
            <p className="mock-text">No hay tareas pendientes</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Ingresa un título arriba para registrar tu primera tarea.</p>
          </div>
        ) : (
          <>
            {/* Filtros dinámicos */}
            <div className="dashboard-filter-tabs">
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todas ({tasks.length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pendientes ({tasks.filter(t => !t.completed).length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completadas ({tasks.filter(t => t.completed).length})
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <p>No se encontraron tareas en esta sección.</p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => {
                  const isEditing = task.id === editingTaskId;
                  const isHighPriority = task.priority === 'alta';
                  const cardClass = `task-card ${isEditing ? 'task-card-edit-mode' : ''} ${isHighPriority && !task.completed ? 'priority-alta' : ''}`;

                  return (
                    <div key={task.id} className={cardClass}>
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
                                <div style={{ position: 'relative', width: '100%' }}>
                                  <input
                                    type="date"
                                    className="form-input"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    style={{ paddingRight: '36px' }}
                                    required
                                  />
                                  <span 
                                    style={{ 
                                      position: 'absolute', 
                                      right: '12px', 
                                      top: '50%', 
                                      transform: 'translateY(-50%)', 
                                      pointerEvents: 'none',
                                      fontSize: '14px' 
                                    }}
                                  >
                                    📅
                                  </span>
                                </div>
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
                              onClick={() => handleUpdateTask(task.id)} 
                              className="auth-button" 
                              style={{ marginTop: 0, width: 'auto', paddingInline: '16px', fontSize: '13px' }}
                            >
                              Guardar
                            </button>
                            <button 
                              onClick={() => setEditingTaskId(null)} 
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
                                onChange={() => handleToggleStatus(task.id, task.completed)}
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
                              onClick={() => handleEditClick(task)} 
                              className="edit-task-button"
                              style={{ marginRight: '8px' }}
                            >
                              Editar
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="delete-task-button">
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Notificación Toast flotante */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
