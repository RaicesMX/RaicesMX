// src/app/login/login.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';

/**
 * Componente de Login
 *
 * Permite a los usuarios existentes iniciar sesión en RaícesMX.
 * Maneja el auto-completado del email cuando viene desde el registro.
 * Usa cookies HTTP-Only para máxima seguridad del token JWT.
 *
 * Seguridad:
 * - Sanitiza el email antes de enviar al backend
 * - Usa cookies HTTP-Only para el token JWT
 * - Valida campos antes de enviar
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  /** Servicio de autenticación para manejar login */
  private authService = inject(AuthService);

  /** Router para navegación entre páginas */
  private router = inject(Router);

  /** ActivatedRoute para leer query params (si los hubiera) */
  private route = inject(ActivatedRoute);

  // Campos del formulario
  email = '';
  password = '';

  // Estados de UI
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  /**
   * Inicialización del componente
   *
   * Verifica si el usuario viene desde el registro
   * para auto-completar el email y mostrar mensaje de bienvenida
   */
  ngOnInit() {
    /**
     * Obtiene el state de la navegación
     *
     * El state se establece cuando navegamos desde register:
     * this.router.navigate(['/login'], { state: { email: '...', fromRegister: true } })
     */
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as {
      email?: string;
      fromRegister?: boolean;
    };

    /**
     * Si viene desde registro, auto-completa el email
     * y muestra mensaje de bienvenida
     *
     * NOTA: Usamos el email original (no sanitizado) aquí porque:
     * - Angular sanitizará automáticamente en el template
     * - Queremos mostrar exactamente lo que el usuario escribió
     * - La sanitización se hace al enviar, no al mostrar
     */
    if (state?.fromRegister && state?.email) {
      this.email = state.email;
      this.successMessage =
        '¡Cuenta creada exitosamente! 🎉 Ahora ingresa tu contraseña para continuar';

      /**
       * Limpia el mensaje después de 8 segundos
       * para no saturar la UI
       */
      setTimeout(() => {
        this.successMessage = '';
      }, 8000);
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Sanitiza input del usuario antes de enviar al backend
   *
   * Protección XSS: Escapa caracteres HTML peligrosos
   * que podrían ejecutar scripts maliciosos.
   *
   * IMPORTANTE: Esta función es idéntica a la de RegisterComponent
   * para mantener consistencia en la sanitización.
   *
   * Conversiones:
   * - & → &amp; (debe ir primero)
   * - < → &lt; (previene <script>)
   * - > → &gt; (previene </script>)
   * - " → &quot; (previene atributos HTML)
   * - ' → &#x27; (previene atributos HTML)
   * - / → &#x2F; (previene cierre de tags)
   *
   * @param input String a sanitizar
   * @returns String sanitizado y sin espacios extras
   *
   * @example
   * sanitizeInput("user@example.com<script>")
   * // Retorna: "user@example.com&lt;script&gt;"
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;') // Debe ir primero
      .replace(/</g, '&lt;') // Escapa
      .replace(/>/g, '&gt;') // Escapa >
      .replace(/"/g, '&quot;') // Escapa "
      .replace(/'/g, '&#x27;') // Escapa '
      .replace(/\//g, '&#x2F;') // Escapa /
      .trim(); // Remueve espacios
  }

  /**
   * Maneja el envío del formulario de login
   *
   * Flujo:
   * 1. Valida que los campos no estén vacíos
   * 2. Sanitiza el email para prevenir XSS
   * 3. Llama al AuthService.login() que hace la petición HTTP
   * 4. El backend establece una cookie HTTP-Only con el token JWT
   * 5. Redirige al marketplace si el login es exitoso
   * 6. Muestra error si las credenciales son incorrectas
   */
  onSubmit() {
    // Validación: campos vacíos
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    // Inicia estado de carga
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    /**
     * Sanitiza el email antes de enviar
     *
     * IMPORTANTE: La contraseña NO se sanitiza porque:
     * - No se muestra en la UI (siempre está oculta)
     * - Puede contener caracteres especiales legítimos
     * - Se compara con el hash en el backend
     * - No se renderiza en HTML
     *
     * El email SÍ se sanitiza porque:
     * - Podría mostrarse en mensajes de error
     * - Previene inyección de scripts en logs
     * - Es una buena práctica sanitizar antes de enviar
     */
    const sanitizedEmail = this.sanitizeInput(this.email);

    /**
     * Llama al servicio de autenticación
     *
     * AuthService.login() hace una petición POST a /auth/login
     * con withCredentials: true para recibir cookies HTTP-Only
     */
    this.authService
      .login({
        email: sanitizedEmail, // ← Email sanitizado
        password: this.password, // ← Contraseña sin sanitizar
      })
      .subscribe({
        /**
         * Maneja respuesta exitosa
         *
         * En este punto:
         * - El backend ya estableció la cookie HTTP-Only
         * - El AuthService actualizó el estado de autenticación
         * - El usuario está listo para acceder a rutas protegidas
         */
        next: (response) => {
          console.log('✅', response.message);

          /**
           * Redirige al marketplace (ruta protegida)
           *
           * El authGuard verificará automáticamente
           * la cookie HTTP-Only antes de permitir el acceso
           */
          this.router.navigate(['/marketplace']);
        },

        /**
         * Maneja errores de autenticación
         *
         * Posibles errores:
         * - 401: Credenciales incorrectas (email o password inválidos)
         * - 400: Datos mal formateados
         * - 500: Error del servidor
         * - Network error: Sin conexión al backend
         */
        error: (error) => {
          console.error('❌ Error en login:', error);

          /**
           * Muestra mensaje de error al usuario
           *
           * Usa el mensaje del backend si está disponible,
           * o un mensaje genérico como fallback
           *
           * NOTA: No revelamos si el email existe o no por seguridad
           */
          this.errorMessage = error.error?.message || 'Email o contraseña incorrectos';
          this.isLoading = false;
        },

        /**
         * Se ejecuta al finalizar (éxito o error)
         */
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  /**
   * Inicia el flujo de OAuth con Google
   *
   * Redirige al endpoint del backend que maneja Google OAuth
   */
  loginWithGoogle() {
    // Redirige al endpoint de Google OAuth del backend
    window.location.href = 'http://localhost:3000/auth/google';
  }
}
