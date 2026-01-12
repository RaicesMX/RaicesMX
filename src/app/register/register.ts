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
   * Maneja el envío del formulario de registro
   *
   * Flujo:
   * 1. Valida que todos los campos estén completos
   * 2. Verifica que las contraseñas coincidan
   * 3. Valida longitud mínima de contraseña
   * 4. Envía petición al backend
   * 5. Redirige al login con email pre-llenado si es exitoso
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

    // Concatena nombre completo
    const fullName = `${this.nombre} ${this.apellido}`;

    /**
     * Petición POST al backend para registrar usuario
     *
     * IMPORTANTE: withCredentials: true es necesario para que
     * el navegador acepte y guarde las cookies HTTP-Only
     * que el backend establece en la respuesta
     */
    this.http
      .post(
        'http://localhost:3000/auth/register',
        {
          email: this.email,
          fullName: fullName,
          password: this.password,
          isSeller: false, // Por defecto registra como comprador
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
         * queremos que el usuario inicie sesión conscientemente
         */
        next: (response: any) => {
          console.log('✅', response.message);

          /**
           * Redirige al login con el email en el state
           * para auto-completar el campo de email
           */
          this.router.navigate(['/login'], {
            state: {
              email: this.email,
              fromRegister: true,
            },
          });
        },

        /**
         * Maneja errores de la petición
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
