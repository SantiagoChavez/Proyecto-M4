import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guardián de rutas privadas para proteger vistas de accesos no autenticados.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Muestra una pantalla de espera transitoria mientras se verifica la sesión
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // Redirige al login si el usuario no está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};