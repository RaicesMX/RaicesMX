// src/app/guards/public.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const publicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, redirigir a marketplace
  if (authService.isAuthenticated()) {
    router.navigate(['/marketplace']);
    return false;
  }

  return true;
};
