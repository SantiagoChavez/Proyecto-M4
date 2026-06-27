import { useAuth } from '../hooks/useAuth';

/**
 * Vista principal y privada del gestor de tareas (Dashboard).
 */
export const Dashboard = () => {
  const { user, logout } = useAuth();

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
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
        <p className="welcome-subtitle">Administra tus pendientes diarios con persistencia en la nube.</p>

        {/* Contenedor provisorio con datos mockeados para listado del Hito 7 */}
        <div className="tasks-container-mock">
          <span className="mock-icon" aria-hidden="true">📋</span>
          <p className="mock-text">No hay tareas creadas todavía</p>
          <p style={{ fontSize: '14px', margin: 0 }}>Las tareas creadas por el usuario se visualizarán en este contenedor.</p>
        </div>
      </main>
    </div>
  );
};
