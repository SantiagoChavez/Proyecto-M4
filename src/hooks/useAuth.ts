import { useContext } from 'react';
import { AuthContext } from '../features/auth/AuthContext';
import type { AuthContextType } from '../features/auth/AuthContext';

/**
 * Hook para consumir el contexto de autenticación de forma segura y tipada.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Validación de seguridad si el hook se usa fuera del proveedor
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado estrictamente dentro de un AuthProvider.');
  }

  return context;
};