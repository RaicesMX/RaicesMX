// src/app/guards/auth.guard.ts (versión con manejo de errores)
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError, map, of, take } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, permite inmediatamente
  if (authService.isAuthenticated()) {
    console.log('✅ Guard: Usuario ya autenticado');
    return true;
  }

  // Si no, verifica con el backend
  console.log('⏳ Guard: Verificando sesión con backend...');

  return authService.getProfile().pipe(
    take(1),
    map((response) => {
      if (response && response.user) {
        // Sesión válida
        console.log('✅ Guard: Sesión válida, acceso permitido');
        authService.currentUser.set(response.user);
        authService.isAuthenticated.set(true);
        return true;
      } else {
        // No hay sesión
        console.log('❌ Guard: Sin sesión, redirigiendo al login');
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError((error) => {
      // Error 401 o cualquier otro error
      console.log('❌ Guard: Error al verificar sesión (probablemente 401), redirigiendo al login');
      router.navigate(['/login']);
      return of(false);
    }),
  );
};
