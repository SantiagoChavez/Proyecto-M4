/**
 * Representa una tarea del negocio en el sistema.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string; // ID del usuario propietario de la tarea
  createdAt: string; // Marca de tiempo en formato ISO
}
