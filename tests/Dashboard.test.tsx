import type React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../src/pages/Dashboard';
import { 
  getTasksByUser, 
  updateTask 
} from '../src/services/taskService';
import type { Task } from '../src/types/task.types';

// Mockear react-router-dom para evitar errores de navegación y enrutamiento
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

const mockUser = { uid: 'test-user-123', email: 'user@test.com' };
const mockLogout = vi.fn();

// Mockear useAuth para retornar un usuario autenticado predeterminado
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

// Mockear el servicio de base de datos Firestore de tareas
vi.mock('../src/services/taskService', () => ({
  getTasksByUser: vi.fn(),
  createTask: vi.fn(),
  toggleTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
}));

describe('Dashboard Component - Hito 8 Testing', () => {
  let firestoreCallback: (tasks: Task[]) => void;
  let firestoreErrorCallback: (error: Error) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());

    // Mockear la suscripción en tiempo real de Firestore para retener las funciones callback
    vi.mocked(getTasksByUser).mockImplementation((_userId, callback, errorCallback) => {
      firestoreCallback = callback;
      if (errorCallback) {
        firestoreErrorCallback = errorCallback;
      }
      // Simular lista vacía por defecto
      callback([]);
      return () => {};
    });
  });

  // 1. TEST DE INFRAESTRUCTURA (Corte de Conexión en Firestore)
  test('debe capturar el fallo de suscripción en onSnapshot, detener la carga y renderizar un error amigable en pantalla', async () => {
    render(<Dashboard />);
    
    // Simular que firestore arroja un error en tiempo real (corte de red / permisos insuficientes)
    await waitFor(() => {
      firestoreErrorCallback(new Error('Permission denied or network failure'));
    });

    // Validar que se detenga la carga y se pinte el error
    expect(screen.queryByText('Cargando tareas en tiempo real...')).not.toBeInTheDocument();
    expect(screen.getByText('Error al sincronizar las tareas desde el servidor.')).toBeInTheDocument();
  });

  // 2. TEST DE SEGURIDAD (Prevención de XSS - Cross-Site Scripting)
  test('debe renderizar contenido HTML/JS inyectado de forma segura como texto plano en el DOM y no ejecutarlo', async () => {
    const maliciousTask: Task = {
      id: 'malicious-1',
      title: '<script>window.location.href="badsite"</script>',
      description: '<img src="x" onerror="alert(1)" />',
      completed: false,
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
    };

    render(<Dashboard />);

    // Simular el empuje de la tarea maliciosa desde Firestore
    await waitFor(() => {
      firestoreCallback([maliciousTask]);
    });

    // Comprobar que el texto exacto se muestra en pantalla de forma literal (escapado por React)
    expect(screen.getByText('<script>window.location.href="badsite"</script>')).toBeInTheDocument();
    expect(screen.getByText('<img src="x" onerror="alert(1)" />')).toBeInTheDocument();
  });

  // 3. TEST DE RESILIENCIA EN RED (Falla 400 Bad Request en Serverless Function)
  test('debe procesar una respuesta 400 del servidor al enviar el reporte por correo y mostrar el error en pantalla', async () => {
    // Mockear fetch para devolver 400 Bad Request
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ error: 'Formato de correo no válido o parámetros incorrectos.' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<Dashboard />);

    // Encontrar y hacer clic en el botón de enviar reporte
    const reportButton = screen.getByText('Enviar reporte de tareas por correo');
    await userEvent.click(reportButton);

    // Verificar que la petición se haya realizado
    expect(mockFetch).toHaveBeenCalledWith('/api/send-email', expect.any(Object));

    // Comprobar que el error del backend se renderiza en la pantalla
    await waitFor(() => {
      expect(screen.getByText('Error en el servidor: Estado 400')).toBeInTheDocument();
    });
  });

  // 4. TEST DE INTEGRIDAD VISUAL (Límites de Texto y Saltos de Línea)
  test('debe montar correctamente en el DOM tareas con títulos extremadamente largos, descripciones multilínea y emojis complejos', async () => {
    const longTitle = 'a'.repeat(250);
    const multilineDesc = 'Línea 1\nLínea 2\nLínea 3';
    const complexEmojis = '👨‍👩‍👧‍👦🚀🔥💀💯';

    const extremeTask: Task = {
      id: 'extreme-1',
      title: longTitle,
      description: `${multilineDesc} ${complexEmojis}`,
      completed: false,
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
    };

    render(<Dashboard />);

    await waitFor(() => {
      firestoreCallback([extremeTask]);
    });

    // Validar que se encuentren todos los elementos en el DOM sin fallar la renderización
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(/Línea 1/)).toBeInTheDocument();
    expect(screen.getByText(/Línea 2/)).toBeInTheDocument();
    expect(screen.getByText(/Línea 3.*👨‍👩‍👧‍👦🚀🔥💀💯/)).toBeInTheDocument();
  });

  // 5. TEST DE COMPORTAMIENTO (CRUD - Flujo de Edición Completo)
  test('debe abrir la edición inline, permitir el cambio de campos, guardar cambios e invocar al servicio de actualización de base de datos', async () => {
    const initialTask: Task = {
      id: 'task-to-edit',
      title: 'Título Original',
      description: 'Descripción Original',
      completed: false,
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
    };

    render(<Dashboard />);

    // Cargar la tarea inicial en el Dashboard
    await waitFor(() => {
      firestoreCallback([initialTask]);
    });

    // Encontrar la tarjeta y el botón editar antes de transformarse
    const taskCard = screen.getByText('Título Original').closest('.task-card') as HTMLElement;
    const editButton = within(taskCard).getByRole('button', { name: 'Editar' });

    // Clic en el botón Editar
    await userEvent.click(editButton);

    // Verificar que aparezcan los campos de entrada inline con los valores precargados
    // Usamos 'within' para buscar solo dentro de la tarjeta de la tarea y evitar colisionar con el formulario de creación
    const titleInput = within(taskCard).getByPlaceholderText('Título de la tarea') as HTMLInputElement;
    const descInput = within(taskCard).getByPlaceholderText('Descripción (opcional)') as HTMLInputElement;

    expect(titleInput.value).toBe('Título Original');
    expect(descInput.value).toBe('Descripción Original');

    // Simular escritura en los campos
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Título Modificado');
    await userEvent.clear(descInput);
    await userEvent.type(descInput, 'Descripción Modificada');

    // Hacer clic en Guardar
    const saveButton = screen.getByRole('button', { name: 'Guardar' });
    await userEvent.click(saveButton);

    // Verificar que se haya llamado al servicio updateTask con los datos editados
    expect(updateTask).toHaveBeenCalledWith('task-to-edit', {
      title: 'Título Modificado',
      description: 'Descripción Modificada',
    });
  });
});
