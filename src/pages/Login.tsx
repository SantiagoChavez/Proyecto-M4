import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authErrors';

/**
 * Vista de inicio de sesión de la aplicación.
 */
export const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Iniciar sesión con email y contraseña
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await loginWithEmail(email, password);
      navigate('/');
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
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        setError(getAuthErrorMessage((err as { code: string }).code));
      } else {
        setError('Ocurrió un error inesperado al conectar con Google.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder al gestor de tareas.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <button onClick={handleGoogleLogin} className="auth-button-secondary">
          Continuar con Google
        </button>

        <div className="auth-footer">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
