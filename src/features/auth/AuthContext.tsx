import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from '../../services/firebase';

/* Interfaz para el estado y los métodos provistos por el contexto de autenticación.*/
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

// Creación del contexto con un valor inicial indefinido.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación que envuelve a la aplicación.
 * Gestiona el estado de sesión del usuario y las funciones principales de Firebase Auth.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Escuchar el estado de la sesión de forma persistente.
  useEffect(() => {
    // onAuthStateChanged retorna una función de desuscripción.
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpieza de la suscripción al desmontar el componente para prevenir fugas de memoria.
    return () => unsubscribe();
  }, []);

  /**
   * Inicia sesión con correo electrónico y contraseña.
   */
  const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Registra un nuevo usuario con correo electrónico y contraseña.
   */
  const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Inicia sesión utilizando la ventana emergente de Google.
   */
  const loginWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  /**
   * Cierra la sesión activa del usuario.
   */
  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  // Objeto con el valor del contexto a proveer a los componentes hijos.
  const value: AuthContextType = {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
