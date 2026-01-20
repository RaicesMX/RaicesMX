// src/app/service/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

export interface User {
  id: number;
  email: string;
  fullName: string;
  isSeller: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  isSeller?: boolean;
}

/**
 * Servicio de Autenticación con Persistencia de Sesión
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  /**
   * Estado reactivo del usuario actual
   */
  currentUser = signal<User | null>(null);

  /**
   * Estado reactivo de autenticación
   */
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    /**
     * Inicia verificación de sesión en background
     * El guard manejará la verificación cuando sea necesario
     */
    this.checkAuthInBackground();
  }

  /**
   * Verifica sesión en background (sin bloquear)
   *
   * Útil para:
   * - Actualizar UI cuando el usuario ya está en una página pública
   * - Pre-cargar estado de autenticación
   */
  private checkAuthInBackground(): void {
    this.getProfile()
      .pipe(
        catchError(() => {
          // Sesión no válida, estado permanece en false
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          if (response && response.user) {
            console.log('✅ Sesión en background restaurada:', response.user.email);
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        },
      });
  }

  /**
   * Registro de nuevos usuarios
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            console.log('✅ Usuario registrado:', response.user);
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        }),
      );
  }

  /**
   * Login de usuarios existentes
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            console.log('✅ Login exitoso:', response.user);
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        }),
      );
  }

  /**
   * Obtiene el perfil del usuario autenticado
   *
   * IMPORTANTE: Este método es usado por:
   * 1. El guard para verificar sesión
   * 2. Componentes que necesitan datos del usuario
   * 3. Verificación en background
   */
  getProfile(): Observable<{ success: boolean; message: string; user: User } | null> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        user: User;
      }>(`${this.apiUrl}/profile`, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response && response.user) {
            // Actualizar el estado local
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        }),
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('✅ Sesión cerrada');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      }),
    );
  }

  /**
   * Verifica si el usuario actual es vendedor
   */
  isSeller(): boolean {
    return this.currentUser()?.isSeller ?? false;
  }
}
