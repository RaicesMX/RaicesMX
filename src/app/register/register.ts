// src/app/register/register.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  nombre = '';
  apellido = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  isLoading = false;
  errorMessage = '';

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  onSubmit() {
    if (!this.nombre || !this.apellido || !this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const fullName = `${this.nombre} ${this.apellido}`;

    // Llamada directa a la API sin guardar el token
    this.http
      .post('http://localhost:3000/auth/register', {
        email: this.email,
        fullName: fullName,
        password: this.password,
        isSeller: false,
      })
      .subscribe({
        next: (response: any) => {
          console.log('✅', response.message);
          // Redirigir al login con el email en el state
          this.router.navigate(['/login'], {
            state: {
              email: this.email,
              fromRegister: true,
            },
          });
        },
        error: (error) => {
          console.error('❌ Error en registro:', error);
          this.errorMessage = error.error?.message || 'Error al crear la cuenta';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
}
