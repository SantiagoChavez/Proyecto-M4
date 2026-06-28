# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-06-27

### Añadido
- Servicio `src/services/taskService.ts` para gestionar las operaciones CRUD de tareas con Firestore usando APIs modulares de v9+: `getTasksByUser` (escucha en tiempo real), `createTask`, `toggleTaskStatus` y `deleteTask`.
- Integración completa del CRUD de tareas en la interfaz del `Dashboard` (`src/pages/Dashboard.tsx`) conectando el formulario de creación, el cambio de estado mediante checkbox y la eliminación de ítems con persistencia remota.
- Manejo reactivo de la carga y el desmontaje de la suscripción de `onSnapshot` para prevenir fugas de memoria.
- Clases de estilo CSS añadidas a `src/App.css` para el formulario y tarjetas de tareas con diseño responsivo integrado.
- Función Serverless en `functions/send-email.js` que utiliza el cliente AWS SES SDK v3 (`@aws-sdk/client-ses`) para procesar solicitudes POST y enviar correos de reporte de tareas de forma segura desde el backend.
- Archivo proxy `api/send-email.js` para exponer el endpoint del reporte en `/api/send-email` manteniendo la compatibilidad zero-config en Vercel.
- Integración en la interfaz de usuario `src/pages/Dashboard.tsx` con el botón "Enviar reporte de tareas por correo" para recopilar, dar formato en español y despachar el resumen de tareas en tiempo real.
- Estados en React (`emailLoading`, `emailSuccess`, `emailError`) y clases CSS en `src/App.css` para proveer retroalimentación visual clara durante el proceso de envío.

### Modificado
- Robustecido el manejo de respuestas en `handleSendEmailReport` dentro de `src/pages/Dashboard.tsx` agregando validaciones del código de estado HTTP y del Content-Type de las cabeceras para prevenir fallos al parsear JSON vacío en el entorno de desarrollo local de Vite.

## [0.6.0] - 2026-06-26

### Añadido
- Vistas base en `src/pages/`: `Login.tsx` (formulario de inicio de sesión con email/password y soporte para Google), `Register.tsx` (formulario de registro) y `Dashboard.tsx` (estructura principal y encabezado del gestor de tareas).
- Rutas públicas y privadas integradas en `src/App.tsx` usando `react-router-dom`, envolviendo las rutas con `AuthProvider` y protegiendo el panel del Dashboard con `ProtectedRoute`.
- Estilos visuales adaptados y organizados en `src/App.css` con clases CSS Vanilla para maquetar tarjetas, inputs, botones de acción y layouts.

## [0.5.0] - 2026-06-26

### Añadido
- Archivo `src/types/task.types.ts` con la definición e interfaz estricta de `Task` para el modelo de datos de las tareas.
- Archivo `firestore.rules` en la raíz del proyecto para definir reglas de seguridad en Cloud Firestore que restringen el acceso a las tareas únicamente a sus creadores/propietarios autenticados.

## [0.4.0] - 2026-06-26

### Añadido
- Archivo `src/routes/ProtectedRoute.tsx` que actúa como guardián de rutas privadas.
- Propiedades tipadas (`ProtectedRouteProps`) para envolver componentes hijos (`children`).
- Manejo del estado `loading` para prevenir parpadeos y desajustes visuales mientras se comprueba la sesión con Firebase.
- Redirección automática segura mediante `<Navigate to="/login" replace />` de `react-router-dom` para usuarios no autenticados.

## [0.3.0] - 2026-06-26

### Añadido
- Archivo `src/features/auth/AuthContext.tsx` que provee el contexto global de autenticación (`AuthContext`) e inicializa el proveedor `AuthProvider`.
- Métodos integrados en el contexto de autenticación: `loginWithEmail`, `registerWithEmail`, `loginWithGoogle` (utilizando popups) y `logout`.
- Suscripción al estado de la sesión mediante `onAuthStateChanged` con desuscripción automática al desmontar para evitar fugas de memoria.
- Custom hook `src/hooks/useAuth.ts` que permite un consumo tipado y seguro del contexto de autenticación global.
- Utilidad `src/utils/authErrors.ts` para la traducción estricta de códigos de error de Firebase Auth a mensajes amigables para el usuario final en español.

## [0.2.0] - 2026-06-26

### Añadido
- Archivo `src/services/firebase.ts` para centralizar la conexión con el backend as a service (BaaS).
- Instancia nombrada `auth` (Firebase Authentication) para la gestión del estado de sesión de los usuarios.
- Instancia nombrada `db` (Cloud Firestore) para dar soporte a la futura persistencia de datos.
- Archivo `src/vite-env.d.ts` que extiende la interfaz de entorno de Vite para forzar el tipado estricto en TypeScript de las credenciales, previniendo fallos en tiempo de compilación.

## [0.1.0] - 2026-06-22

### Añadido
- Estructura de carpetas inicial en `src/` para aplicar separación de responsabilidades y Clean Architecture:
  - `pages/` (Vistas principales de la SPA)
  - `components/` (Componentes globales y compartidos de la UI)
  - `features/` (Módulos por características de negocio)
  - `services/` (Lógica de comunicación con APIs, Firebase, AWS, etc.)
  - `routes/` (Configuración de rutas de la aplicación)
  - `hooks/` (Hooks personalizados de React reutilizables)
  - `types/` (Tipos e interfaces de TypeScript)
  - `utils/` (Funciones de utilidad y constantes comunes)
- Estructura de carpetas en la raíz para infraestructura y soporte:
  - `functions/` (Para Vercel Serverless Functions)
  - `tests/` (Para configuraciones y suites de pruebas)
- Archivo plantilla `.env.example` en la raíz con variables para Firebase y AWS.

### Modificado
- Archivo `.gitignore` en la raíz para bloquear la subida accidental de archivos de entorno locales (`.env`, `.env.local` y `.env.production`).