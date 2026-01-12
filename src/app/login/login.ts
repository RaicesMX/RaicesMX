// src/app/login/login.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    // Verificar si viene desde el registro con el email
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { email?: string; fromRegister?: boolean };

    if (state?.fromRegister && state?.email) {
      this.email = state.email;
      this.successMessage =
        '¡Cuenta creada exitosamente! 🎉 Ahora ingresa tu contraseña para continuar';

      // Limpiar el mensaje después de 8 segundos
      setTimeout(() => {
        this.successMessage = '';
      }, 8000);
    }

    // También verificar queryParams (método alternativo)
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true' && params['email']) {
        this.email = params['email'];
        this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('✅', response.message);
        this.router.navigate(['/marketplace']);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.errorMessage = error.error?.message || 'Email o contraseña incorrectos';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
