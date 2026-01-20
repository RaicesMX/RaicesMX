// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de Autenticación
 *
 * Con HTTP-Only Cookies, ya no necesitamos agregar manualmente
 * el Authorization header. Las cookies se envían automáticamente
 * con withCredentials: true.
 *
 * Este interceptor asegura que TODAS las peticiones incluyan
 * withCredentials: true para enviar cookies.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * Clona la petición y agrega withCredentials: true
   *
   * Esto hace que el navegador:
   * 1. Envíe automáticamente las cookies HTTP-Only
   * 2. Acepte cookies Set-Cookie del backend
   */
  const clonedReq = req.clone({
    withCredentials: true,
  });

  return next(clonedReq);
};
