# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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