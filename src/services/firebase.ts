import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 1. Configuración de Firebase obtenida de las variables de entorno de Vite.
// Se mapean única y exclusivamente usando import.meta.env para evitar hardcodear credenciales en el código fuente.
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 2. Inicialización de la aplicación de Firebase.
// Esta es la instancia central que conecta nuestra aplicación frontend con el backend de Firebase.
const app: FirebaseApp = initializeApp(firebaseConfig);

// 3. Inicialización y exportación nombrada de los servicios.
// 'auth' gestiona la autenticación de usuarios (registro, inicio y cierre de sesión).
export const auth: Auth = getAuth(app);

// 'db' gestiona las operaciones de persistencia en la base de datos NoSQL Cloud Firestore.
export const db: Firestore = getFirestore(app);
