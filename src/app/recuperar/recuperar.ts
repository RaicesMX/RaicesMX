// src/app/recuperar/recuperar.component.ts
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.scss'],
})
export class RecuperarComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = `${environment.apiUrl}/auth/password-reset`;

  currentStep = 1;
  email = '';
  verificationCode = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  message = '';
  isSuccess = false;
  showNewPassword = false;
  showConfirmPassword = false;

  resendCooldown = 0;
  private resendInterval?: any;

  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  hasUpperCase = false;
  hasLowerCase = false;
  hasNumber = false;
  hasSpecialChar = false;

  private sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * PASO 1: Enviar código al email
   * Cambio INSTANTÁNEO al paso 2
   */
  onSubmitEmail() {
    if (!this.email) {
      this.showMessage('Por favor ingresa tu correo electrónico', false);
      return;
    }

    this.isLoading = true;
    this.message = ''; // Limpiar mensaje anterior

    const sanitizedEmail = this.sanitizeInput(this.email);

    this.http
      .post<{
        success: boolean;
        message: string;
      }>(`${this.apiUrl}/request`, { email: sanitizedEmail }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          // Cambio INSTANTÁNEO al paso 2
          this.currentStep = 2;
          this.cdr.detectChanges();

          // Mostrar mensaje de éxito brevemente
          this.showMessage(response.message, true, 3000);

          // Iniciar cooldown
          this.startResendCooldown();
        },
        error: (error) => {
          this.isLoading = false;
          this.showMessage(error.error?.message || 'Error al enviar el código', false);
        },
      });
  }

  /**
   * PASO 2: Verificar código
   * Cambio INSTANTÁNEO al paso 3
   */
  onSubmitCode() {
    if (this.verificationCode.length !== 6) {
      this.showMessage('El código debe tener 6 dígitos', false);
      return;
    }

    this.isLoading = true;
    this.message = ''; // Limpiar mensaje anterior

    this.http
      .post<{ success: boolean; message: string }>(
        `${this.apiUrl}/verify`,
        {
          email: this.sanitizeInput(this.email),
          code: this.verificationCode,
        },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          // Cambio INSTANTÁNEO al paso 3
          this.currentStep = 3;
          this.cdr.detectChanges();

          // Mostrar mensaje de éxito brevemente
          this.showMessage(response.message, true, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.showMessage(error.error?.message || 'Código inválido o expirado', false);
        },
      });
  }

  /**
   * PASO 3: Restablecer contraseña
   * Cambio INSTANTÁNEO al paso 4 (éxito)
   */
  onSubmitNewPassword() {
    if (!this.isFormValid()) {
      this.showMessage('Por favor completa todos los requisitos', false);
      return;
    }

    this.isLoading = true;
    this.message = ''; // Limpiar mensaje anterior

    this.http
      .post<{ success: boolean; message: string }>(
        `${this.apiUrl}/reset`,
        {
          email: this.sanitizeInput(this.email),
          code: this.verificationCode,
          newPassword: this.newPassword,
        },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          // Cambio INSTANTÁNEO al paso 4 (pantalla de éxito)
          this.currentStep = 4;
          this.cdr.detectChanges();

          // El mensaje de éxito se muestra en la pantalla del paso 4
          // No necesitamos mostrar toast aquí
        },
        error: (error) => {
          this.isLoading = false;
          this.showMessage(error.error?.message || 'Error al restablecer contraseña', false);
        },
      });
  }

  /**
   * Reenviar código de verificación
   */
  resendCode() {
    if (this.resendCooldown > 0) return;

    this.verificationCode = '';
    this.message = '';
    this.onSubmitEmail();
  }

  /**
   * Inicia cooldown de 10 segundos para reenvío
   */
  private startResendCooldown() {
    this.resendCooldown = 10;

    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  /**
   * Navegar al paso anterior
   */
  previousStep() {
    if (this.currentStep > 1 && this.currentStep < 4) {
      this.currentStep--;
      this.message = '';
    }
  }

  /**
   * Alternar visibilidad de contraseñas
   */
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Validar fortaleza de contraseña
   */
  checkPasswordStrength() {
    const password = this.newPassword;

    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [
      password.length >= 8,
      this.hasUpperCase,
      this.hasLowerCase,
      this.hasNumber,
      this.hasSpecialChar,
    ].filter(Boolean).length;

    if (score <= 2) this.passwordStrength = 'weak';
    else if (score <= 4) this.passwordStrength = 'medium';
    else this.passwordStrength = 'strong';
  }

  /**
   * Verificar si las contraseñas coinciden
   */
  passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.confirmPassword.length > 0;
  }

  /**
   * Validar formulario completo
   */
  isFormValid(): boolean {
    return (
      this.newPassword.length >= 8 &&
      this.hasUpperCase &&
      this.hasLowerCase &&
      this.hasNumber &&
      this.hasSpecialChar &&
      this.passwordsMatch()
    );
  }

  /**
   * Textos dinámicos
   */
  getPasswordStrengthText(): string {
    const texts = {
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
    };
    return texts[this.passwordStrength];
  }

  getPasswordMatchText(): string {
    if (!this.confirmPassword) return '';
    return this.passwordsMatch() ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden';
  }

  /**
   * Mostrar mensaje temporal
   *
   * @param text Texto del mensaje
   * @param success true = éxito (verde), false = error (rojo)
   * @param duration Duración en milisegundos (por defecto 3000ms)
   */
  private showMessage(text: string, success: boolean, duration: number = 3000) {
    this.message = text;
    this.isSuccess = success;

    setTimeout(() => {
      this.message = '';
    }, duration);
  }

  /**
   * Limpieza al destruir componente
   */
  ngOnDestroy() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }
}
