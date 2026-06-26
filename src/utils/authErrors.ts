/**
 * Traduce los códigos de error comunes de Firebase Auth a mensajes descriptivos en español.
 * 
 * @param errorCode - Código de error devuelto por la API de Firebase.
 * @returns Mensaje de error amigable para el usuario final en español.
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales proporcionadas son incorrectas o han expirado.';
    case 'auth/email-already-in-use':
      return 'El correo electrónico ingresado ya está registrado. Intente iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido deshabilitada.';
    case 'auth/user-not-found':
      return 'No se encontró ningún usuario con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/popup-closed-by-user':
      return 'El inicio de sesión con Google fue cancelado.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de inicio de sesión con Google.';
    case 'auth/operation-not-allowed':
      return 'El método de autenticación seleccionado no está habilitado en la consola de Firebase.';
    case 'auth/too-many-requests':
      return 'Acceso bloqueado temporalmente debido a demasiados intentos fallidos. Intente más tarde.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifique su conexión a internet e intente de nuevo.';
    default:
      return 'Ocurrió un error inesperado al procesar la autenticación. Intente de nuevo.';
  }
};
