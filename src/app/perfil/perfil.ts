import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  // ====== HEADER Y MENÚS ======
  menuAbierto = false;
  menuMovilAbierto = false;
  esMovil = false;
  itemsCarrito = 3;

  // ====== DATOS DEL USUARIO ======
  usuario = {
    nombre: 'Juan Pérez Rodríguez',
    email: 'juan.perez@email.com',
    telefono: '+52 55 1234 5678',
    curp: 'PERJ800101HDFRNN09',
    fechaNacimiento: '1980-01-01',
    fechaRegistro: '2024-01-15'
  };

  // ====== PESTAÑAS Y ESTADO ======
  tabActiva = 'informacion';
  editando = false;
  mostrarHistorial = false;
  usuarioEditado = { ...this.usuario };

  // ====== DIRECCIONES ======
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

  // ====== PRODUCTOS ======
  productos = [
    {
      id: 1,
      nombre: 'Artesanía de Barro Tradicional',
      descripcion: 'Pieza única elaborada por artesanos mexicanos',
      precio: 450,
      stock: 5,
      visitas: 120,
      estado: 'activo',
      imagen: 'https://via.placeholder.com/300x180/7A1A2C/FFFFFF?text=Artesan%C3%ADa+Barro'
    },
    {
      id: 2,
      nombre: 'Textil Bordado a Mano',
      descripcion: 'Mantel bordado con técnicas tradicionales',
      precio: 320,
      stock: 3,
      visitas: 85,
      estado: 'activo',
      imagen: 'https://via.placeholder.com/300x180/D4AF37/FFFFFF?text=Textil+Bordado'
    },
    {
      id: 3,
      nombre: 'Joyería de Plata',
      descripcion: 'Collar de plata con detalles artesanales',
      precio: 780,
      stock: 0,
      visitas: 210,
      estado: 'vendido',
      imagen: 'https://via.placeholder.com/300x180/2D3748/FFFFFF?text=Joyer%C3%ADa+Plata'
    }
  ];

  // ====== CONFIGURACIONES ======
  verificacionDosPasos = false;
  notificacionesEmail = true;
  notificacionesPush = true;

  // ====== HISTORIAL ======
  historial = [
    {
      id: 1,
      descripcion: 'Publicaste un nuevo producto: "Artesanía de Barro Tradicional"',
      fecha: new Date('2024-01-15T10:30:00'),
      icono: 'icon-package'
    },
    {
      id: 2,
      descripcion: 'Actualizaste tu información personal',
      fecha: new Date('2024-01-14T15:45:00'),
      icono: 'icon-user'
    },
    {
      id: 3,
      descripcion: 'Agregaste una nueva dirección de envío',
      fecha: new Date('2024-01-13T09:20:00'),
      icono: 'icon-location'
    },
    {
      id: 4,
      descripcion: 'Realizaste una compra: "Textil Bordado a Mano"',
      fecha: new Date('2024-01-12T16:30:00'),
      icono: 'icon-shopping-cart'
    },
    {
      id: 5,
      descripcion: 'Recibiste una nueva reseña en tu producto',
      fecha: new Date('2024-01-11T11:15:00'),
      icono: 'icon-star'
    }
  ];

  ngOnInit() {
    this.detectarMovil();
  }

  @HostListener('window:resize')
  detectarMovil() {
    this.esMovil = window.innerWidth <= 992;
    if (!this.esMovil) {
      this.menuMovilAbierto = false;
    }
  }

  // ====== MENÚS ======
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuMovil() {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.menuAbierto = false;
    }
  }

  // ====== NAVEGACIÓN ======
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
    
    // Agregar al historial
    this.historial.unshift({
      id: Date.now(),
      descripcion: 'Actualizaste tu información personal',
      fecha: new Date(),
      icono: 'icon-user'
    });
    
    console.log('Información actualizada correctamente');
  }

  // ====== DIRECCIONES ======
  agregarDireccion() {
    console.log('Agregar dirección - Funcionalidad próxima');
  }

  editarDireccion(i: number) {
    console.log(`Editando dirección: ${this.direcciones[i].nombre}`);
  }

  eliminarDireccion(i: number) {
    if (confirm(`¿Eliminar "${this.direcciones[i].nombre}"?`)) {
      this.direcciones.splice(i, 1);
      console.log('Dirección eliminada');
    }
  }

  establecerPrincipal(i: number) {
    this.direcciones.forEach(d => d.principal = false);
    this.direcciones[i].principal = true;
    console.log('Dirección principal actualizada');
  }

  // ====== PRODUCTOS ======
  editarProducto(i: number) {
    console.log(`Editando producto: ${this.productos[i].nombre}`);
  }

  pausarProducto(i: number) {
    const producto = this.productos[i];
    producto.estado = producto.estado === 'activo' ? 'pausado' : 'activo';
    console.log(`Producto ${producto.estado === 'activo' ? 'activado' : 'pausado'}`);
  }

  eliminarProducto(i: number) {
    if (confirm(`¿Eliminar "${this.productos[i].nombre}"?`)) {
      this.productos.splice(i, 1);
      console.log('Producto eliminado');
    }
  }

  verHistorial() {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  // ====== SEGURIDAD ======
  cambiarContrasena() {
    console.log('Cambiar contraseña - Funcionalidad próxima');
  }

  eliminarCuenta() {
    if (confirm('¿Estás seguro de eliminar tu cuenta permanentemente?\nEsta acción no se puede deshacer.')) {
      console.log('Cuenta eliminada');
    }
  }

  // ====== SESIÓN ======
  cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
      this.menuMovilAbierto = false;
      console.log('Sesión cerrada');
    }
  }
}