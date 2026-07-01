import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mate404 from '../assets/matecode-404.png';

/**
 * Componente de página para error 404 (Ruta no encontrada).
 * Muestra un mensaje amigable con la imagen de MateCode y redirige
 * automáticamente al inicio después de un temporizador de 5 segundos.
 */
export function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="notfound-layout">
      <div className="notfound-card">
        <img src={mate404} alt="MateCode 404" className="notfound-img" />
        <h1 className="notfound-title">404</h1>
        <p className="notfound-text">
          La ruta que estás buscando no existe. Te estamos llevando de vuelta a la central de MateCode.
        </p>
        <button onClick={() => navigate('/', { replace: true })} className="notfound-btn">
          Ir al inicio
        </button>
        <p className="notfound-timer">
          Te redirigimos en {countdown} {countdown === 1 ? 'segundo' : 'segundos'}.
        </p>
      </div>
    </div>
  );
}
