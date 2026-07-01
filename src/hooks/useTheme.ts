import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Hook personalizado para manejar el tema (Light/Dark Mode) global de la aplicación.
 * Lee y persiste el tema seleccionado en localStorage y actualiza la clase en el elemento raíz html.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved as Theme;
    }
    // Si no está definido en localStorage, se utiliza la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme, setTheme };
};
