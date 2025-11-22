import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent {
  // Estado de la pestaña activa
  tabActiva = 'informacion';

  // Datos del usuario (expandidos)
  usuario = {
    nombre: 'Juan Pérez Rodríguez',
    email: 'juan.perez@email.com',
    telefono: '+52 55 1234 5678',
    curp: 'PERJ800101HDFRNN09',
    fechaNacimiento: '1980-01-01',
    fechaRegistro: '2024-01-15'
  };

  // Direcciones del usuario
  direcciones = [
    {
      nombre: 'Casa',
      principal: true,
      calle: 'Av. Reforma 123',
      colonia: 'Cuauhtémoc',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigoPostal: '06500',
      entreCalles: 'Insurgentes y Hamburgo',
      instrucciones: 'Timbre blanco, departamento 5B'
    },
    {
      nombre: 'Oficina',
      principal: false,
      calle: 'Paseo de la Reforma 250',
      colonia: 'Juárez',
      ciudad: 'Ciudad de México',
      estado: 'CDMX', 
      codigoPostal: '06600',
      entreCalles: 'Río Tiber y Río Misisipi',
      instrucciones: 'Recepción, piso 8'
    }
  ];

  // Configuraciones de privacidad
  verificacionDosPasos = false;
  notificacionesEmail = true;

  // Estado de edición
  editando = false;
  usuarioEditado = { ...this.usuario };

  // 🟦 Cambiar pestaña
  cambiarTab(tab: string) {
    this.tabActiva = tab;
    this.editando = false; // Cancelar edición al cambiar de pestaña
  }

  // 🟦 Alternar modo edición
  toggleEdicion() {
    if (this.editando) {
      // Cancelar edición
      this.usuarioEditado = { ...this.usuario };
    }
    this.editando = !this.editando;
  }

  // 🟦 Guardar cambios
  guardarCambios() {
    this.usuario = { ...this.usuarioEditado };
    this.editando = false;
    alert('Información actualizada correctamente');
  }

  // 🟦 Gestión de direcciones
  agregarDireccion() {
    alert('Funcionalidad para agregar dirección - Próximamente');
  }

  editarDireccion(index: number) {
    alert(`Editando dirección: ${this.direcciones[index].nombre}`);
  }

  eliminarDireccion(index: number) {
    if (confirm(`¿Estás seguro de eliminar la dirección "${this.direcciones[index].nombre}"?`)) {
      this.direcciones.splice(index, 1);
    }
  }

  establecerPrincipal(index: number) {
    this.direcciones.forEach(dir => dir.principal = false);
    this.direcciones[index].principal = true;
    alert('Dirección principal actualizada');
  }

  // 🟦 Gestión de privacidad
  cambiarContrasena() {
    alert('Funcionalidad para cambiar contraseña - Próximamente');
  }

  eliminarCuenta() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      alert('Cuenta eliminada - Redirigiendo al inicio');
      // Aquí iría la lógica real de eliminación
    }
  }

  // 🟦 Cerrar sesión
  cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      alert('Sesión cerrada - Redirigiendo al inicio');
      // Aquí iría la lógica real de logout
    }
  }
}