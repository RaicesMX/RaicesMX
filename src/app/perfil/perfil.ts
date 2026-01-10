import { Component, HostListener, OnInit } from '@angular/core';
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
export class PerfilComponent implements OnInit {

  // ====== HEADER Y MENÚS ======
  menuAbierto = false;           // Dropdown del avatar (escritorio)
  menuMovilAbierto = false;      // Menú hamburguesa (móvil)
  esMovil = false;               // Detecta si estamos en móvil
  itemsCarrito = 3;              // Cambia por tu servicio real después

  // ====== DATOS DEL USUARIO ======
  usuario = {
    nombre: 'Juan Pérez Rodríguez',
    email: 'juan.perez@email.com',
    telefono: '+52 55 1234 5678',
    curp: 'PERJ800101HDFRNN09',
    fechaNacimiento: '1980-01-01',
    fechaRegistro: '2024-01-15',
    foto: null as string | null   // Pon aquí la URL real cuando la tengas
  };

  // ====== PESTAÑAS Y ESTADO ======
  tabActiva = 'informacion';
  editando = false;
  usuarioEditado = { ...this.usuario };

  // ====== DIRECCIONES ======
  direcciones = [
    {
      nombre: 'Casa', principal: true,
      calle: 'Av. Reforma 123', colonia: 'Cuauhtémoc',
      ciudad: 'Ciudad de México', estado: 'CDMX', codigoPostal: '06500',
      entreCalles: 'Insurgentes y Hamburgo', instrucciones: 'Timbre blanco, departamento 5B'
    },
    {
      nombre: 'Oficina', principal: false,
      calle: 'Paseo de la Reforma 250', colonia: 'Juárez',
      ciudad: 'Ciudad de México', estado: 'CDMX', codigoPostal: '06600',
      entreCalles: 'Río Tiber y Río Misisipi', instrucciones: 'Recepción, piso 8'
    }
  ];

  verificacionDosPasos = false;
  notificacionesEmail = true;

  // ====== INICIALIZACIÓN ======
  ngOnInit() {
    this.detectarMovil();
  }

  // Detecta si es móvil al cargar y al redimensionar
  @HostListener('window:resize')
  detectarMovil() {
    this.esMovil = window.innerWidth <= 992;
    if (!this.esMovil) {
      this.menuMovilAbierto = false;  // Cierra menú móvil si pasas a desktop
    }
  }

  // ====== MENÚS ======
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuMovil() {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  // Cierra dropdown de escritorio al hacer click fuera
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.menuAbierto = false;
    }
  }

  // ====== PESTAÑAS Y EDICIÓN ======
  cambiarTab(tab: string) {
    this.tabActiva = tab;
    this.editando = false;
  }

  toggleEdicion() {
    if (this.editando) {
      this.usuarioEditado = { ...this.usuario };
    }
    this.editando = !this.editando;
  }

  guardarCambios() {
    this.usuario = { ...this.usuarioEditado };
    this.editando = false;
    alert('Información actualizada correctamente');
  }

  // ====== DIRECCIONES ======
  agregarDireccion() { alert('Funcionalidad para agregar dirección - Próximamente'); }
  editarDireccion(i: number) { alert(`Editando dirección: ${this.direcciones[i].nombre}`); }
  eliminarDireccion(i: number) {
    if (confirm(`¿Eliminar "${this.direcciones[i].nombre}"?`)) {
      this.direcciones.splice(i, 1);
    }
  }
  establecerPrincipal(i: number) {
    this.direcciones.forEach(d => d.principal = false);
    this.direcciones[i].principal = true;
    alert('Dirección principal actualizada');
  }

  // ====== SEGURIDAD ======
  cambiarContrasena() { alert('Cambiar contraseña - Próximamente'); }
  eliminarCuenta() {
    if (confirm('¿Eliminar cuenta permanentemente?')) {
      alert('Cuenta eliminada');
    }
  }

  // ====== SESIÓN ======
  cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
      this.menuMovilAbierto = false;
      alert('Sesión cerrada - Redirigiendo...');
      // Aquí irá tu lógica real de logout
    }
  }
}