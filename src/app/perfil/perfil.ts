// src/app/perfil/perfil.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss'],
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estado de la tab activa
  tabActiva: 'informacion' | 'direcciones' | 'productos' | 'seguridad' = 'informacion';

  // ✅ Usar getter que lee del signal (se actualiza automáticamente)
  get usuario() {
    const user = this.authService.currentUser();
    return {
      nombre: user?.fullName || '',
      email: user?.email || '',
      curp: '',
      telefono: '',
      fechaNacimiento: '',
    };
  }

  // Copia para edición
  usuarioEditado = {
    nombre: '',
    email: '',
    curp: '',
    telefono: '',
    fechaNacimiento: '',
  };

  // Estados de UI
  editando = false;
  verificacionDosPasos = false;
  notificacionesEmail = true;
  notificacionesPush = false;

  // Direcciones del usuario
  direcciones: any[] = [
    {
      nombre: 'Casa',
      calle: 'Av. Reforma 123',
      colonia: 'Centro',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigoPostal: '06600',
      entreCalles: 'Insurgentes y Juárez',
      instrucciones: 'Portón negro',
      principal: true,
    },
  ];

  // Productos del usuario
  productos: any[] = [
    {
      nombre: 'Alebrije artesanal',
      descripcion: 'Alebrije tallado en madera de copal',
      precio: 850,
      stock: 5,
      visitas: 124,
      imagen: 'assets/images/producto-ejemplo.jpg',
      estado: 'activo',
    },
  ];

  ngOnInit() {
    // Verificar que haya usuario autenticado
    const user = this.authService.currentUser();

    if (!user) {
      console.log('⚠️ No hay usuario en estado local, verificando con backend...');

      // Si no hay usuario en el signal, intentar obtener del backend
      this.authService.getProfile().subscribe({
        next: (response) => {
          if (!response || !response.user) {
            // No hay sesión válida, redirigir al login
            this.router.navigate(['/login']);
          }
        },
        error: () => {
          // Error al obtener perfil, redirigir al login
          this.router.navigate(['/login']);
        },
      });
    } else {
      console.log('✅ Usuario cargado:', user);
    }
  }

  cambiarTab(tab: 'informacion' | 'direcciones' | 'productos' | 'seguridad') {
    this.tabActiva = tab;
    this.editando = false;
  }

  toggleEdicion() {
    this.editando = !this.editando;

    if (this.editando) {
      // Al activar edición, copiar datos actuales
      this.usuarioEditado = { ...this.usuario };
    }
  }

  guardarCambios() {
    console.log('💾 Guardando cambios:', this.usuarioEditado);

    // TODO: Hacer petición al backend para actualizar
    // this.http.patch('/users/me', this.usuarioEditado).subscribe(...)

    this.editando = false;
    alert('✅ Cambios guardados correctamente');
  }

  cerrarSesion() {
    const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');

    if (confirmar) {
      console.log('🚪 Cerrando sesión...');

      this.authService.logout().subscribe({
        next: (response) => {
          console.log('✅ Sesión cerrada:', response.message);
        },
        error: (error) => {
          console.error('❌ Error al cerrar sesión:', error);
          this.authService.currentUser.set(null);
          this.authService.isAuthenticated.set(false);
          this.router.navigate(['/login']);
        },
      });
    }
  }

  cambiarContrasena() {
    this.router.navigate(['/recuperar']);
  }

  eliminarCuenta() {
    const confirmar = confirm(
      '⚠️ ADVERTENCIA: Esta acción es irreversible. ¿Estás seguro de que deseas eliminar tu cuenta permanentemente?',
    );

    if (confirmar) {
      const confirmar2 = confirm(
        '¿REALMENTE deseas eliminar tu cuenta? Todos tus datos se perderán.',
      );

      if (confirmar2) {
        console.log('🗑️ Eliminando cuenta...');
        alert('Funcionalidad de eliminación de cuenta en desarrollo');
      }
    }
  }

  // ========== MÉTODOS DE DIRECCIONES ==========

  agregarDireccion() {
    alert('Funcionalidad de agregar dirección en desarrollo');
  }

  editarDireccion(index: number) {
    console.log('✏️ Editando dirección:', this.direcciones[index]);
    alert('Funcionalidad de editar dirección en desarrollo');
  }

  eliminarDireccion(index: number) {
    const confirmar = confirm('¿Estás seguro de eliminar esta dirección?');

    if (confirmar) {
      this.direcciones.splice(index, 1);
      alert('✅ Dirección eliminada');
    }
  }

  establecerPrincipal(index: number) {
    this.direcciones.forEach((d) => (d.principal = false));
    this.direcciones[index].principal = true;
    alert('✅ Dirección establecida como principal');
  }

  // ========== MÉTODOS DE PRODUCTOS ==========

  editarProducto(index: number) {
    console.log('✏️ Editando producto:', this.productos[index]);
    alert('Funcionalidad de editar producto en desarrollo');
  }

  pausarProducto(index: number) {
    const producto = this.productos[index];
    producto.estado = producto.estado === 'activo' ? 'pausado' : 'activo';
    alert(`✅ Producto ${producto.estado === 'activo' ? 'activado' : 'pausado'}`);
  }

  eliminarProducto(index: number) {
    const confirmar = confirm('¿Estás seguro de eliminar este producto?');

    if (confirmar) {
      this.productos.splice(index, 1);
      alert('✅ Producto eliminado');
    }
  }
}
