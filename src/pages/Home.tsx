import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import matecodeHomeClaro from '../assets/matecode-home-claro.png';
import matecodeHomeOscuro from '../assets/matecode-home-oscuro.png';

/**
 * Componente de la página de inicio (Landing Page) institucional.
 * Muestra información corporativa y permite la navegación al portal de inicio de sesión.
 */
export const Home = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="home-container">
      {/* Barra de navegación superior fija */}
      <nav className="navbar" id="home-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            MATECODE SOLUTIONS
          </Link>

          <div className="navbar-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
            </button>
            <Link to="/login" className="navbar-login-btn">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Sección Hero con las imágenes de identidad y textos requeridos */}
      <div className="home-hero-container">
        {theme === 'light' ? (
          <div className="home-hero-image-wrapper">
            <img
              src={matecodeHomeClaro}
              alt="Bienvenidos a MateCode Solutions"
              className="home-hero-img"
            />
          </div>
        ) : (
          <div className="home-hero-dark-flow">
            <div className="home-hero-text-block">
              <h1 className="home-hero-title">BIENVENIDOS</h1>
              <p className="home-hero-subtitle">
                SOMOS TU SOCIO EN DESARROLLO DE SOFTWARE Y SOLUCIONES DIGITALES. COMBINAMOS LA TRADICIÓN CON LA INNOVACIÓN CÓDIGO A CÓDIGO.
              </p>
            </div>
            <div className="home-hero-image-wrapper">
              <img
                src={matecodeHomeOscuro}
                alt="MateCode Solutions Background"
                className="home-hero-img"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
