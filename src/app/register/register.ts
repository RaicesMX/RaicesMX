// src/app/register/register.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

/**
 * Componente de Registro
 *
 * Permite a nuevos usuarios crear una cuenta en RaícesMX.
 * Después del registro exitoso, redirige al login con el email pre-llenado.
 *
 * Seguridad:
 * - Sanitiza todos los inputs antes de enviar al backend
 * - Valida formato de email y longitud de contraseña
 * - Usa cookies HTTP-Only para el token JWT
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  /** Cliente HTTP para hacer peticiones al backend */
  private http = inject(HttpClient);

  /** Router para navegación entre páginas */
  private router = inject(Router);

  // Campos del formulario
  nombre = '';
  apellido = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Estados de UI
  showPassword = false;
  showConfirm = false;
  isLoading = false;
  errorMessage = '';

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  /**
   * Sanitiza input del usuario antes de enviar al backend
   *
   * Protección XSS: Escapa caracteres HTML peligrosos
   * que podrían ejecutar scripts maliciosos.
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
   * sanitizeInput("<script>alert('XSS')</script>Juan")
   * // Retorna: "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;Juan"
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;') // Debe ir primero para no escapar los & de otros escapes
      .replace(/</g, '&lt;') // Escapa < (previene <script>)
      .replace(/>/g, '&gt;') // Escapa > (previene </script>)
      .replace(/"/g, '&quot;') // Escapa " (previene onclick="...")
      .replace(/'/g, '&#x27;') // Escapa ' (previene onclick='...')
      .replace(/\//g, '&#x2F;') // Escapa / (previene </)
      .trim(); // Remueve espacios al inicio y final
  }

  /**
   * Maneja el envío del formulario de registro
   *
   * Flujo:
   * 1. Valida que todos los campos estén completos
   * 2. Verifica que las contraseñas coincidan
   * 3. Valida longitud mínima de contraseña
   * 4. Sanitiza los datos para prevenir XSS
   * 5. Envía petición al backend con datos sanitizados
   * 6. Redirige al login con email pre-llenado si es exitoso
   */
  onSubmit() {
    // Validación: campos vacíos
    if (!this.nombre || !this.apellido || !this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    // Validación: contraseñas coinciden
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Validación: longitud mínima
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Inicia estado de carga
    this.isLoading = true;
    this.errorMessage = '';

    /**
     * Sanitiza todos los inputs antes de enviar
     *
     * IMPORTANTE: La contraseña NO se sanitiza porque:
     * - No se muestra en la UI (siempre está oculta)
     * - Puede contener caracteres especiales legítimos
     * - Se hashea en el backend antes de guardarse
     */
    const sanitizedNombre = this.sanitizeInput(this.nombre);
    const sanitizedApellido = this.sanitizeInput(this.apellido);
    const sanitizedEmail = this.sanitizeInput(this.email);
    const fullName = `${sanitizedNombre} ${sanitizedApellido}`;

    /**
     * Petición POST al backend para registrar usuario
     *
     * IMPORTANTE: withCredentials: true es necesario para que
     * el navegador acepte y guarde las cookies HTTP-Only
     * que el backend establece en la respuesta
     *
     * Datos enviados:
     * - email: Email sanitizado
     * - fullName: Nombre completo sanitizado
     * - password: Contraseña SIN sanitizar (se hashea en backend)
     * - isSeller: false por defecto (comprador)
     */
    this.http
      .post(
        'http://localhost:3000/auth/register',
        {
          email: sanitizedEmail,
          fullName: fullName,
          password: this.password, // NO sanitizar contraseñas
          isSeller: false,
        },
        {
          withCredentials: true, // ← MUY IMPORTANTE para cookies HTTP-Only
        }
      )
      .subscribe({
        /**
         * Maneja respuesta exitosa
         *
         * El backend establece automáticamente una cookie HTTP-Only
         * con el token JWT, pero no la guardamos manualmente porque
         * queremos que el usuario inicie sesión conscientemente.
         *
         * Backend también sanitiza los datos con el decorador @Sanitize()
         * como capa adicional de seguridad (defensa en profundidad).
         */
        next: (response: any) => {
          console.log('✅', response.message);

          /**
           * Redirige al login con el email ORIGINAL (no sanitizado)
           * en el state para auto-completar el campo de email.
           *
           * Usamos el email original porque:
           * - El usuario necesita ver el email que escribió
           * - Angular sanitizará automáticamente en el template
           */
          this.router.navigate(['/login'], {
            state: {
              email: this.email, // Email original para UX
              fromRegister: true,
            },
          });
        },

        /**
         * Maneja errores de la petición
         *
         * Errores comunes:
         * - 409: Email ya registrado
         * - 400: Datos inválidos
         * - 500: Error del servidor
         */
        error: (error) => {
          console.error('❌ Error en registro:', error);
          this.errorMessage = error.error?.message || 'Error al crear la cuenta';
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
}
