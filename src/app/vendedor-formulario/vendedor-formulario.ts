// src/app/vendedor-formulario/vendedor-formulario.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-vendedor-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vendedor-formulario.html',
  styleUrls: ['./vendedor-formulario.scss'],
})
export class VendedorFormulario implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Campos del formulario
  curp = '';

  // Archivos seleccionados
  ineFront: File | null = null;
  ineBack: File | null = null;

  // Previews de imágenes
  ineFrontPreview: string | null = null;
  ineBackPreview: string | null = null;

  // Estados de UI
  isLoading = false;
  message = '';
  isSuccess = false;
  hasExistingRequest = false;
  existingRequestStatus: 'pending' | 'approved' | 'rejected' | null = null;

  ngOnInit() {
    // Verificar si ya tiene una solicitud
    this.checkExistingRequest();
  }

  /**
   * Verifica si el usuario ya tiene una solicitud de vendedor
   */
  checkExistingRequest() {
    this.http
      .get<any>('http://localhost:3000/seller-requests/me', {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          if (response.hasRequest) {
            this.hasExistingRequest = true;
            this.existingRequestStatus = response.request.status;

            // Mostrar mensaje según el estado
            if (response.request.status === 'pending') {
              this.showMessage(
                'Ya tienes una solicitud pendiente. Espera a que sea revisada.',
                false,
              );
            } else if (response.request.status === 'approved') {
              this.showMessage('¡Tu cuenta de vendedor ya fue aprobada!', true);
            } else if (response.request.status === 'rejected') {
              this.showMessage(
                `Tu solicitud fue rechazada. Razón: ${response.request.rejectionReason || 'No especificada'}`,
                false,
              );
            }
          }
        },
        error: (error) => {
          console.error('Error al verificar solicitud:', error);
        },
      });
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelect(event: Event, type: 'front' | 'back') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.showMessage('Solo se permiten imágenes', false);
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showMessage('La imagen no debe superar 5MB', false);
      return;
    }

    // Asignar archivo
    if (type === 'front') {
      this.ineFront = file;
      this.createPreview(file, 'front');
    } else {
      this.ineBack = file;
      this.createPreview(file, 'back');
    }
  }

  /**
   * Crea preview de la imagen
   */
  createPreview(file: File, type: 'front' | 'back') {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'front') {
        this.ineFrontPreview = reader.result as string;
      } else {
        this.ineBackPreview = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Elimina archivo seleccionado
   */
  removeFile(type: 'front' | 'back') {
    if (type === 'front') {
      this.ineFront = null;
      this.ineFrontPreview = null;
    } else {
      this.ineBack = null;
      this.ineBackPreview = null;
    }
  }

  /**
   * Valida el formulario
   */
  isFormValid(): boolean {
    // CURP debe tener 18 caracteres
    if (this.curp.length !== 18) {
      return false;
    }

    // Debe tener al menos la imagen frontal
    if (!this.ineFront) {
      return false;
    }

    return true;
  }

  /**
   * Envía el formulario
   */
  onSubmit() {
    // Validar formulario
    if (!this.isFormValid()) {
      this.showMessage('Por favor completa todos los campos requeridos correctamente', false);
      return;
    }

    // Verificar que no tenga solicitud pendiente
    if (this.hasExistingRequest && this.existingRequestStatus === 'pending') {
      this.showMessage('Ya tienes una solicitud pendiente', false);
      return;
    }

    this.isLoading = true;
    this.message = '';

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('curp', this.curp.toUpperCase());

    if (this.ineFront) {
      formData.append('ineFront', this.ineFront);
    }

    if (this.ineBack) {
      formData.append('ineBack', this.ineBack);
    }

    // Enviar solicitud al backend
    this.http
      .post<any>('http://localhost:3000/seller-requests', formData, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Solicitud enviada:', response);
          this.showMessage(response.message, true);

          // Limpiar formulario
          this.curp = '';
          this.ineFront = null;
          this.ineBack = null;
          this.ineFrontPreview = null;
          this.ineBackPreview = null;

          // Actualizar estado
          this.hasExistingRequest = true;
          this.existingRequestStatus = 'pending';

          // Redirigir al perfil después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/perfil']);
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Error al enviar solicitud:', error);
          this.showMessage(error.error?.message || 'Error al enviar la solicitud', false);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  /**
   * Muestra mensaje temporal
   */
  private showMessage(text: string, success: boolean) {
    this.message = text;
    this.isSuccess = success;

    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
