import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getTasksByUser, 
  createTask, 
  toggleTaskStatus, 
  deleteTask,
  updateTask
} from '../services/taskService';
import type { Task } from '../types/task.types';
import { TaskForm } from '../components/TaskForm';
import { TaskCard } from '../components/TaskCard';
import { Toast } from '../components/Toast';

/**
 * Panel de control principal (Dashboard) para gestionar tareas en tiempo real.
 * Componente contenedor inteligente que distribuye y sincroniza el estado.
 */
export const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Estados para las tareas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el flujo de envío de correos
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // ID de la tarea actualmente en modo edición
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: 'alta' | 'media' | 'baja';
    dueDate: string;
    assignedArea: 'desarrollo' | 'diseño' | 'marketing' | 'soporte';
  }) => {
    setError(null);

    if (!user) return;

    try {
      await createTask({
        ...taskData,
        completed: false,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
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

  // Guardar cambios de una tarea editada
  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    setError(null);

    setEditingTaskId(null);

    try {
      await updateTask(taskId, updatedFields);
      setToast({ message: 'Tarea actualizada correctamente', type: 'success' });
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
        <TaskForm onCreateTask={handleCreateTask} error={error} />

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
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isEditing={task.id === editingTaskId}
                    onEditClick={() => setEditingTaskId(task.id)}
                    onCancelClick={() => setEditingTaskId(null)}
                    onUpdateTask={handleUpdateTask}
                    onToggleStatus={() => handleToggleStatus(task.id, task.completed)}
                    onDeleteClick={() => handleDeleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Notificación Toast flotante */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};
