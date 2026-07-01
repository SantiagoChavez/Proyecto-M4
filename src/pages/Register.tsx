import { useState, useEffect, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useTheme } from '../hooks/useTheme';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

/**
 * Vista de registro de nuevos usuarios con diseño visual premium.
 */
export const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  const { registerWithEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Registrar nuevo usuario con correo y contraseña
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await registerWithEmail(email, password);
      await signOut(auth);
      navigate('/login', { state: { message: 'Cuenta registrada con éxito. Por favor, inicia sesión.' } });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        setError(getAuthErrorMessage((err as { code: string }).code));
      } else {
        setError('Ocurrió un error inesperado al registrar el usuario.');
      }
    } finally {
      setSubmitting(false);
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
        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate para comenzar a gestionar tus tareas pendientes.</p>

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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
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
            {submitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <div>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión aquí
            </Link>
          </div>
          <button onClick={() => navigate('/')} className="auth-back-btn">
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};
