// src/app/recuperar/recuperar.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.scss']
})
export class RecuperarComponent {
  // Paso 1
  email = '';
  
  // Paso 2
  verificationCode = '';
  resendCooldown = 0;
  
  // Paso 3
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  passwordStrength = 'weak';
  
  // Estado general
  currentStep = 1;
  isLoading = false;
  message = '';
  isSuccess = false;

  // Paso 1: Enviar código
  onSubmitEmail() {
    if (!this.email) {
      this.showMessage('Por favor ingresa tu correo electrónico', false);
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showMessage('Por favor ingresa un correo electrónico válido', false);
      return;
    }

    this.isLoading = true;
    
    // Simulación de envío de código
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 2;
      this.startResendCooldown();
      this.showMessage('Código de verificación enviado correctamente', true);
    }, 1500);
  }

  // Paso 2: Verificar código
  onSubmitCode() {
    if (this.verificationCode.length !== 6) {
      this.showMessage('Por favor ingresa el código de 6 dígitos', false);
      return;
    }

    this.isLoading = true;
    
    // Simulación de verificación
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 3;
      this.showMessage('Código verificado correctamente', true);
    }, 1500);
  }

  // Paso 3: Nueva contraseña
  onSubmitNewPassword() {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    
    // Simulación de actualización
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 4; // Paso de éxito
      this.showMessage('Contraseña actualizada exitosamente', true);
    }, 2000);
  }

  // Navegación entre pasos
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Reenviar código
  resendCode() {
    if (this.resendCooldown > 0) return;

    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.startResendCooldown();
      this.showMessage('Código reenviado correctamente', true);
    }, 1000);
  }

  private startResendCooldown() {
    this.resendCooldown = 30;
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  // Validaciones de contraseña
  checkPasswordStrength() {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    if (strongRegex.test(this.newPassword)) {
      this.passwordStrength = 'strong';
    } else if (mediumRegex.test(this.newPassword)) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'weak';
    }
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'strong': return 'Fuerte';
      case 'medium': return 'Media';
      default: return 'Débil';
    }
  }

  passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.newPassword.length > 0;
  }

  getPasswordMatchText(): string {
    if (!this.confirmPassword) return '';
    return this.passwordsMatch() ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden';
  }

  isFormValid(): boolean {
    return this.passwordsMatch() && 
           this.newPassword.length >= 8 &&
           this.hasUpperCase &&
           this.hasLowerCase &&
           this.hasNumber &&
           this.hasSpecialChar;
  }

  // Getters para requisitos de contraseña
  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPassword);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.newPassword);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.newPassword);
  }

  // Toggle visibilidad de contraseñas
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Utilidades
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showMessage(text: string, success: boolean) {
    this.message = text;
    this.isSuccess = success;
    
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}