import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getTasksByUser, 
  createTask, 
  toggleTaskStatus, 
  deleteTask 
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
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el flujo de envío de correos
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Escuchar tareas en tiempo real asociadas al usuario autenticado
  useEffect(() => {
    if (!user) return;

    const unsubscribe = getTasksByUser(user.uid, (loadedTasks) => {
      setTasks(loadedTasks);
      setLoadingTasks(false);
    });

    // Limpieza al desmontar
    return () => unsubscribe();
  }, [user]);

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
      });
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      console.error('Error al crear tarea:', err);
      setError('No se pudo crear la tarea. Intente de nuevo.');
    }
  };

  // Cambiar el estado completado de una tarea
  const handleToggleStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTaskStatus(taskId, currentStatus);
    } catch (err: unknown) {
      console.error('Error al actualizar tarea:', err);
    }
  };

  // Eliminar una tarea por ID
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err: unknown) {
      console.error('Error al eliminar tarea:', err);
    }
  };

  // Formatear y enviar el reporte de tareas por correo
  const handleSendEmailReport = async () => {
    if (!user?.email) {
      setEmailError('No hay un correo electrónico asociado a la cuenta de usuario.');
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
      .map(t => `- [${t.completed ? 'COMPLETADA' : 'PENDIENTE'}] ${t.title}${t.description ? ` (${t.description})` : ''}`)
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

      // 1. Validar estado de la respuesta antes de procesar el contenido
      if (!response.ok) {
        throw new Error(`Error en el servidor: Estado ${response.status}`);
      }

      // 2. Comprobar si el contenido es JSON antes de intentar parsearlo
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
      }

      // Éxito basado puramente en estatus HTTP 200 si no hay JSON
      setEmailSuccess(true);
    } catch (err: unknown) {
      console.error('Error en el reporte de correos:', err);
      setEmailError(err instanceof Error ? err.message : 'Error al enviar el reporte por correo.');
    } finally {
      setEmailLoading(false);
    }
  };

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
            <button type="submit" className="auth-button" style={{ marginTop: 0, width: 'auto', paddingInline: '24px' }}>
              Agregar
            </button>
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
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
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
                  </div>
                </div>
                <div className="task-actions">
                  <button onClick={() => handleDeleteTask(task.id)} className="delete-task-button">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
