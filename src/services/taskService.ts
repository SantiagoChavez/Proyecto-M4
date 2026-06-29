import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { Task } from '../types/task.types';

/**
 * Escucha en tiempo real las tareas asociadas a un usuario en Firestore.
 * 
 * @param userId - ID del usuario propietario.
 * @param callback - Función receptora de los datos actualizados.
 * @returns Función de desuscripción de onSnapshot para limpiar recursos.
 */
export const getTasksByUser = (
  userId: string, 
  callback: (tasks: Task[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((documento) => {
        tasks.push({
          id: documento.id,
          ...documento.data()
        } as Task);
      });
      callback(tasks);
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error('Error en tiempo real de Firestore:', error);
      }
    }
  );
};

/**
 * Crea una nueva tarea en la colección 'tasks' de Firestore.
 * 
 * @param taskData - Datos de la tarea excluyendo el ID autogenerado.
 */
export const createTask = async (taskData: Omit<Task, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'tasks'), taskData);
};

/**
 * Alterna el estado de finalización de una tarea.
 * 
 * @param taskId - ID de la tarea.
 * @param currentStatus - Estado de completado actual de la tarea.
 */
export const toggleTaskStatus = async (
  taskId: string, 
  currentStatus: boolean
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    completed: !currentStatus
  });
};

/**
 * Elimina una tarea de Firestore por su ID de documento.
 * 
 * @param taskId - ID del documento a eliminar.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

/**
 * Actualiza los campos específicos de una tarea en Firestore.
 * 
 * @param taskId - ID de la tarea a actualizar.
 * @param fieldsToUpdate - Objeto parcial con los campos a modificar.
 */
export const updateTask = async (
  taskId: string,
  fieldsToUpdate: Partial<Omit<Task, 'id'>>
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, fieldsToUpdate);
};
