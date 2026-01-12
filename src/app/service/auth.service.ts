// src/app/service/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

/**
 * Interfaz de Usuario
 */
export interface User {
  id: number;
  email: string;
  fullName: string;
  isSeller: boolean;
}

/**
 * Respuesta de autenticación del backend
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

/**
 * Petición de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Petición de registro
 */
export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  isSeller?: boolean;
}

/**
 * Servicio de Autenticación
 *
 * Maneja toda la lógica de autenticación usando cookies HTTP-Only:
 * - Login de usuarios
 * - Registro de usuarios
 * - Logout
 * - Verificación de estado de autenticación
 * - Obtención de perfil del usuario
 *
 * IMPORTANTE: Ya NO usa localStorage, todo se maneja con cookies HTTP-Only
 * enviadas automáticamente por el navegador en cada petición.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** URL base de la API de autenticación */
  private apiUrl = 'http://localhost:3000/auth';

  /**
   * Signal con el usuario actual
   *
   * Signals son la forma moderna de manejar estado reactivo en Angular.
   * Cualquier componente puede suscribirse a este signal:
   *
   * user = this.authService.currentUser();
   */
  currentUser = signal<User | null>(null);

  /**
   * Signal que indica si el usuario está autenticado
   */
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    /**
     * Al inicializar el servicio, verifica si hay una sesión activa
     * llamando al backend para obtener el perfil con la cookie existente
     */
    this.checkAuth();
  }

  /**
   * Verifica si hay una sesión activa
   *
   * En lugar de leer desde localStorage (inseguro),
   * hace una petición al backend que lee la cookie HTTP-Only
   * y devuelve el perfil del usuario si el token es válido.
   *
   * Este método se ejecuta automáticamente al cargar la app.
   */
  private checkAuth() {
    /**
     * Intenta obtener el perfil del usuario
     *
     * Si hay una cookie HTTP-Only válida, el backend devolverá
     * el perfil del usuario. Si no, devolverá 401 Unauthorized.
     */
    this.getProfile()
      .pipe(
        /**
         * catchError maneja el caso donde no hay sesión activa (401)
         * sin mostrar errores en la consola
         */
        catchError(() => {
          // No hay sesión activa, esto es normal
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.user) {
            // Hay sesión activa, actualiza el estado
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          } else {
            // No hay sesión activa
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
          }
        },
      });
  }

  /**
   * Registro de nuevos usuarios
   *
   * Envía los datos al backend que:
   * 1. Crea el usuario en la base de datos
   * 2. Genera un token JWT
   * 3. Establece una cookie HTTP-Only con el token
   *
   * @param data Datos de registro del usuario
   * @returns Observable con la respuesta del servidor
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data, {
        withCredentials: true, // ← CRÍTICO: Permite recibir y enviar cookies
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            /**
             * Actualiza el estado local con los datos del usuario
             *
             * La cookie ya fue establecida por el backend,
             * solo necesitamos actualizar el estado de la UI
             */
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        })
      );
  }

  /**
   * Login de usuarios existentes
   *
   * Envía las credenciales al backend que:
   * 1. Valida el email y contraseña
   * 2. Genera un token JWT si son correctas
   * 3. Establece una cookie HTTP-Only con el token
   *
   * @param credentials Email y contraseña del usuario
   * @returns Observable con la respuesta del servidor
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true, // ← CRÍTICO: Permite recibir y enviar cookies
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            /**
             * Actualiza el estado local
             * La cookie HTTP-Only ya fue establecida por el backend
             */
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
          }
        })
      );
  }

  /**
   * Obtiene el perfil del usuario autenticado
   *
   * El backend lee la cookie HTTP-Only automáticamente
   * y devuelve el perfil si el token es válido.
   *
   * @returns Observable con el perfil del usuario
   */
  getProfile(): Observable<{ success: boolean; message: string; user: User } | null> {
    return this.http.get<{ success: boolean; message: string; user: User }>(
      `${this.apiUrl}/profile`,
      {
        withCredentials: true, // ← Envía la cookie automáticamente
      }
    );
  }

  /**
   * Cierra la sesión del usuario
   *
   * Envía una petición al backend que elimina la cookie HTTP-Only
   * y actualiza el estado local.
   *
   * @returns Observable con mensaje de confirmación
   */
  logout(): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true, // ← Envía la cookie para identificar la sesión
        }
      )
      .pipe(
        tap(() => {
          /**
           * Limpia el estado local
           *
           * El backend ya eliminó la cookie HTTP-Only,
           * solo necesitamos limpiar el estado de la UI
           */
          this.currentUser.set(null);
          this.isAuthenticated.set(false);

          // Redirige al login
          this.router.navigate(['/login']);
        })
      );
  }

  /**
   * Verifica si el usuario actual es vendedor
   *
   * @returns true si el usuario es vendedor, false si no
   */
  isSeller(): boolean {
    return this.currentUser()?.isSeller ?? false;
  }
}
