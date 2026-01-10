import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Interface para los productos del carrito
interface ProductoCarrito {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: string;
  artesano: string;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent {
  // Datos de ejemplo para el carrito
  carrito: ProductoCarrito[] = [
    {
      id: 1,
      nombre: 'Alebrije de Oaxaca',
      descripcion: 'Colorida figura artesanal tallada en madera',
      precio: 450.00,
      cantidad: 1,
      imagen: 'assets/images/Alebrigue_Artesanal.jpg',
      categoria: 'Arte Popular',
      artesano: 'Taller Donají'
    },
    {
      id: 2,
      nombre: 'Textil Huichol',
      descripcion: 'Manta tradicional con diseños ancestrales',
      precio: 320.00,
      cantidad: 2,
      imagen: 'assets/images/Textiles Huichole.jpg',
      categoria: 'Textiles',
      artesano: 'Comunidad Wixárica'
    },
    {
      id: 3,
      nombre: 'Cerámica de Talavera',
      descripcion: 'Jarrón artesanal con técnica tradicional',
      precio: 280.00,
      cantidad: 1,
      imagen: 'assets/images/Ceramica_Talavera.jpg',
      categoria: 'Cerámica',
      artesano: 'Alfareros de Puebla'
    }
  ];

  // Estado del cupón
  codigoCupon: string = '';
  cuponAplicado: boolean = false;
  descuento: number = 0;

  // 🟦 Obtener total de items en el carrito
  obtenerTotalItems(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  // 🟦 Calcular subtotal
  calcularSubtotal(): number {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  // 🟦 Calcular envío (gratis sobre $500)
  calcularEnvio(): number {
    const subtotal = this.calcularSubtotal();
    return subtotal >= 500 ? 0 : 80.00;
  }

  // 🟦 Calcular descuento
  calcularDescuento(): number {
    return this.descuento;
  }

  // 🟦 Calcular total
  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularEnvio() - this.calcularDescuento();
  }

  // 🟦 Aumentar cantidad de producto
  aumentarCantidad(index: number): void {
    this.carrito[index].cantidad++;
  }

  // 🟦 Disminuir cantidad de producto
  disminuirCantidad(index: number): void {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
    }
  }

  // 🟦 Eliminar producto del carrito
  eliminarProducto(index: number): void {
    if (confirm(`¿Estás seguro de eliminar "${this.carrito[index].nombre}" del carrito?`)) {
      this.carrito.splice(index, 1);
    }
  }

  // 🟦 Vaciar todo el carrito
  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.carrito = [];
      this.cuponAplicado = false;
      this.descuento = 0;
    }
  }

  // 🟦 Aplicar cupón de descuento
  aplicarCupon(): void {
    if (this.codigoCupon.trim() === '') {
      alert('Por favor ingresa un código de cupón');
      return;
    }

    // Simulación de validación de cupón
    const cuponesValidos = ['RAICES10', 'ARTESANIA15', 'MEXICO20'];
    
    if (cuponesValidos.includes(this.codigoCupon.toUpperCase())) {
      const porcentajeDescuento = this.codigoCupon.toUpperCase() === 'RAICES10' ? 0.10 :
        this.codigoCupon.toUpperCase() === 'ARTESANIA15' ? 0.15 : 0.20;
      
      this.descuento = this.calcularSubtotal() * porcentajeDescuento;
      this.cuponAplicado = true;
      alert(`¡Cupón aplicado! Descuento de ${porcentajeDescuento * 100}% aplicado.`);
    } else {
      alert('Cupón no válido. Intenta con: RAICES10, ARTESANIA15 o MEXICO20');
      this.cuponAplicado = false;
      this.descuento = 0;
    }
  }

  // 🟦 Proceder al pago
  procederPago(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Aquí iría la lógica real de pago
    alert(`Redirigiendo al proceso de pago... Total: $${this.calcularTotal().toFixed(2)}`);
    console.log('Proceso de pago iniciado:', {
      productos: this.carrito,
      subtotal: this.calcularSubtotal(),
      envio: this.calcularEnvio(),
      descuento: this.calcularDescuento(),
      total: this.calcularTotal()
    });
  }
}