import { useState, useEffect, type SubmitEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useTheme } from '../hooks/useTheme';

/**
 * Vista de inicio de sesión de la aplicación con diseño visual premium.
 */
export const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Limpieza inicial controlada para evadir autollenados del navegador
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Limpiar error al desmontar el componente
  useEffect(() => {
    return () => setError(null);
  }, []);

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-cierre del Toast después de 3 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Capturar mensaje de redirección de registro exitoso y mostrarlo como Toast
  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'message' in location.state) {
      const stateObj = location.state as { message: string };
      setTimeout(() => {
        setToast({ message: stateObj.message, type: 'success' });
      }, 0);
      // Limpiar el estado para evitar que aparezca de nuevo al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Iniciar sesión con email y contraseña
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        setError(getAuthErrorMessage((err as { code: string }).code));
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Iniciar sesión con Google
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        setError(getAuthErrorMessage((err as { code: string }).code));
      } else {
        setError('Ocurrió un error inesperado al conectar con Google.');
      }
    }
  };

  return (
    <div className="auth-centered-layout">
      {/* Selector de Tema Ambiental */}
      <div className="theme-toggle-container">
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
        </button>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder al gestor de tareas.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Inputs de despiste invisibles para capturar el Autofill del navegador */}
          <input type="text" name="fake-email" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake-password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="ejemplo@correo.com"
              autoComplete="dont-autofill"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-field"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="******"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🐵' : '🙈'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-separator">o también puedes</p>

        <button onClick={handleGoogleLogin} className="auth-button-secondary">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Iniciar sesión con Google
        </button>

        <div className="auth-footer">
          <div>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </div>
          <button onClick={() => navigate('/')} className="auth-back-btn">
            ← Volver al Inicio
          </button>
        </div>
      </div>
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
