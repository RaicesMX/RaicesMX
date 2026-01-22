import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Interfaces
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

interface DatosEnvio {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
}

interface DatosPago {
  metodo: string;
  numeroTarjeta?: string;
  nombreTitular?: string;
  fechaExpiracion?: string;
  cvv?: string;
}

interface OrdenConfirmada {
  id: string;
  fecha: string;
  productos: ProductoCarrito[];
  envio: DatosEnvio;
  pago: DatosPago;
  subtotal: number;
  envioCosto: number;
  descuento: number;
  total: number;
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

  // Estados del proceso de pago
  pasosCheckout = ['carrito', 'datos', 'pago', 'confirmacion'];
  pasoActual: number = 0;
  
  // Datos del usuario
  datosEnvio: DatosEnvio = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    pais: 'México'
  };
  
  datosPago: DatosPago = {
    metodo: 'tarjeta'
  };
  
  // Orden generada
  ordenConfirmada: OrdenConfirmada | null = null;

  // Procesamiento de pago
  procesandoPago: boolean = false;

  constructor() {
    this.cargarDatosGuardados();
  }

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
    this.guardarDatos();
  }

  // 🟦 Disminuir cantidad de producto
  disminuirCantidad(index: number): void {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
      this.guardarDatos();
    }
  }

  // 🟦 Eliminar producto del carrito
  eliminarProducto(index: number): void {
    if (confirm(`¿Estás seguro de eliminar "${this.carrito[index].nombre}" del carrito?`)) {
      this.carrito.splice(index, 1);
      this.guardarDatos();
    }
  }

  // 🟦 Vaciar todo el carrito
  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.carrito = [];
      this.cuponAplicado = false;
      this.descuento = 0;
      this.guardarDatos();
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
    
    this.guardarDatos();
  }

  // ========== MÉTODOS DEL CHECKOUT ==========

  // 🟦 Proceder al pago (inicia el proceso)
  procederPago(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    this.siguientePaso(); // Ir al paso de datos
  }

  // 🟦 Navegar entre pasos
  siguientePaso(): void {
    if (this.pasoActual < this.pasosCheckout.length - 1) {
      // Validar paso actual antes de avanzar
      if (this.pasoActual === 1 && !this.validarDatosEnvio()) {
        alert('Por favor, completa todos los campos de envío');
        return;
      }
      
      if (this.pasoActual === 2 && !this.validarDatosPago()) {
        alert('Por favor, completa todos los campos de pago');
        return;
      }
      
      this.pasoActual++;
      this.scrollToTop();
      this.guardarDatos();
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
      this.scrollToTop();
      this.guardarDatos();
    }
  }

  irAPaso(paso: number): void {
    // Solo permitir regresar a pasos anteriores
    if (paso >= 0 && paso <= this.pasoActual && paso < this.pasosCheckout.length) {
      this.pasoActual = paso;
      this.scrollToTop();
      this.guardarDatos();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 🟦 Validar datos de envío
  validarDatosEnvio(): boolean {
    const datos = this.datosEnvio;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^\d{10}$/;
    
    if (!datos.nombre || datos.nombre.trim().length < 3) {
      alert('Por favor ingresa un nombre válido (mínimo 3 caracteres)');
      return false;
    }
    
    if (!emailRegex.test(datos.email)) {
      alert('Por favor ingresa un correo electrónico válido');
      return false;
    }
    
    if (!telefonoRegex.test(datos.telefono.replace(/\D/g, ''))) {
      alert('Por favor ingresa un número de teléfono válido (10 dígitos)');
      return false;
    }
    
    if (!datos.direccion || datos.direccion.trim().length < 5) {
      alert('Por favor ingresa una dirección válida');
      return false;
    }
    
    if (!datos.ciudad || datos.ciudad.trim().length < 2) {
      alert('Por favor ingresa una ciudad válida');
      return false;
    }
    
    if (!datos.codigoPostal || !/^\d{5}$/.test(datos.codigoPostal)) {
      alert('Por favor ingresa un código postal válido (5 dígitos)');
      return false;
    }
    
    return true;
  }

  // 🟦 Validar datos de pago
  validarDatosPago(): boolean {
    if (this.datosPago.metodo === 'tarjeta') {
      // Validar número de tarjeta (simplificado)
      const numeroTarjeta = this.datosPago.numeroTarjeta?.replace(/\s/g, '');
      if (!numeroTarjeta || numeroTarjeta.length < 16 || !/^\d+$/.test(numeroTarjeta)) {
        alert('Por favor ingresa un número de tarjeta válido (16 dígitos)');
        return false;
      }
      
      if (!this.datosPago.nombreTitular || this.datosPago.nombreTitular.trim().length < 3) {
        alert('Por favor ingresa el nombre del titular de la tarjeta');
        return false;
      }
      
      // Validar fecha MM/AA
      const fechaRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!this.datosPago.fechaExpiracion || !fechaRegex.test(this.datosPago.fechaExpiracion)) {
        alert('Por favor ingresa una fecha de expiración válida (MM/AA)');
        return false;
      }
      
      // Validar CVV
      if (!this.datosPago.cvv || !/^\d{3,4}$/.test(this.datosPago.cvv)) {
        alert('Por favor ingresa un CVV válido (3 o 4 dígitos)');
        return false;
      }
    }
    
    return true;
  }

  // 🟦 Procesar pago simulado
  procesarPago(): void {
    if (!this.validarDatosPago()) {
      return;
    }
    
    this.procesandoPago = true;
    
    // Simular procesamiento de pago (2 segundos)
    setTimeout(() => {
      // Generar orden confirmada
      this.ordenConfirmada = {
        id: 'ORD-' + Date.now().toString().slice(-8),
        fecha: new Date().toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        productos: [...this.carrito],
        envio: { ...this.datosEnvio },
        pago: { ...this.datosPago },
        subtotal: this.calcularSubtotal(),
        envioCosto: this.calcularEnvio(),
        descuento: this.calcularDescuento(),
        total: this.calcularTotal()
      };
      
      // Limpiar carrito y datos temporales
      this.carrito = [];
      this.cuponAplicado = false;
      this.descuento = 0;
      this.codigoCupon = '';
      
      // Limpiar localStorage
      localStorage.removeItem('carritoCompras');
      localStorage.removeItem('checkoutProgreso');
      
      // Ir a confirmación
      this.pasoActual = 3;
      this.procesandoPago = false;
      
      // Mostrar mensaje de éxito
      console.log('Compra procesada exitosamente:', this.ordenConfirmada);
    }, 2000);
  }

  // 🟦 Descargar factura simulada
  descargarFactura(): void {
    if (!this.ordenConfirmada) return;
    
    const factura = `
      ============================================
                    FACTURA SIMULADA
                    Tienda Artesanal
      ============================================
      
      NÚMERO DE ORDEN: ${this.ordenConfirmada.id}
      FECHA: ${this.ordenConfirmada.fecha}
      
      ============================================
                        PRODUCTOS
      ============================================
      ${this.ordenConfirmada.productos.map((p, i) => 
        `${i+1}. ${p.nombre}
           Cantidad: ${p.cantidad} x ${p.precio.toFixed(2)} MXN
           Subtotal: ${(p.precio * p.cantidad).toFixed(2)} MXN
           Categoría: ${p.categoria}
           Artesano: ${p.artesano}
           `
      ).join('\n')}
      
      ============================================
                         TOTALES
      ============================================
      Subtotal: ${this.ordenConfirmada.subtotal.toFixed(2)} MXN
      Envío: ${this.ordenConfirmada.envioCosto.toFixed(2)} MXN
      Descuento: -${this.ordenConfirmada.descuento.toFixed(2)} MXN
      --------------------------------------------
      TOTAL: ${this.ordenConfirmada.total.toFixed(2)} MXN
      
      ============================================
                    DATOS DE ENVÍO
      ============================================
      Nombre: ${this.ordenConfirmada.envio.nombre}
      Email: ${this.ordenConfirmada.envio.email}
      Teléfono: ${this.ordenConfirmada.envio.telefono}
      Dirección: ${this.ordenConfirmada.envio.direccion}
      Ciudad: ${this.ordenConfirmada.envio.ciudad}
      Código Postal: ${this.ordenConfirmada.envio.codigoPostal}
      País: ${this.ordenConfirmada.envio.pais}
      
      ============================================
                    MÉTODO DE PAGO
      ============================================
      Método: ${this.ordenConfirmada.pago.metodo}
      ${this.ordenConfirmada.pago.metodo === 'tarjeta' ? 
        `Tarjeta terminada en: ****${this.ordenConfirmada.pago.numeroTarjeta?.slice(-4)}` : 
        ''}
      
      ============================================
                ¡GRACIAS POR TU COMPRA!
      ============================================
      
      Este es un comprobante simulado para fines de demostración.
    `;
    
    const blob = new Blob([factura], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${this.ordenConfirmada.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert('Factura descargada exitosamente');
  }

  // 🟦 Guardar datos en localStorage
  private guardarDatos(): void {
    // Guardar carrito
    localStorage.setItem('carritoCompras', JSON.stringify(this.carrito));
    
    // Guardar progreso del checkout
    const progreso = {
      pasoActual: this.pasoActual,
      datosEnvio: this.datosEnvio,
      datosPago: this.datosPago,
      cuponAplicado: this.cuponAplicado,
      codigoCupon: this.codigoCupon,
      descuento: this.descuento
    };
    localStorage.setItem('checkoutProgreso', JSON.stringify(progreso));
  }

  // 🟦 Cargar datos guardados
  private cargarDatosGuardados(): void {
    // Cargar carrito
    const carritoGuardado = localStorage.getItem('carritoCompras');
    if (carritoGuardado) {
      try {
        this.carrito = JSON.parse(carritoGuardado);
      } catch (e) {
        console.error('Error al cargar carrito:', e);
      }
    }
    
    // Cargar progreso del checkout
    const progresoGuardado = localStorage.getItem('checkoutProgreso');
    if (progresoGuardado) {
      try {
        const progreso = JSON.parse(progresoGuardado);
        this.pasoActual = progreso.pasoActual || 0;
        this.datosEnvio = progreso.datosEnvio || this.datosEnvio;
        this.datosPago = progreso.datosPago || this.datosPago;
        this.cuponAplicado = progreso.cuponAplicado || false;
        this.codigoCupon = progreso.codigoCupon || '';
        this.descuento = progreso.descuento || 0;
      } catch (e) {
        console.error('Error al cargar progreso:', e);
      }
    }
  }

  // 🟦 Reiniciar compra
  reiniciarCompra(): void {
    if (confirm('¿Deseas comenzar una nueva compra?')) {
      this.pasoActual = 0;
      this.datosEnvio = {
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigoPostal: '',
        pais: 'México'
      };
      this.datosPago = { metodo: 'tarjeta' };
      this.ordenConfirmada = null;
      localStorage.removeItem('checkoutProgreso');
    }
  }

  // 🟦 Formatear número de tarjeta para mostrar
  formatearNumeroTarjeta(): string {
    if (!this.datosPago.numeroTarjeta) return '';
    const numero = this.datosPago.numeroTarjeta.replace(/\s/g, '');
    if (numero.length <= 4) return numero;
    return '**** **** **** ' + numero.slice(-4);
  }

  // 🟦 Verificar si se puede avanzar al siguiente paso
  puedeAvanzar(): boolean {
    switch (this.pasoActual) {
      case 0: // Carrito
        return this.carrito.length > 0;
      case 1: // Datos
        return this.validarDatosEnvio();
      case 2: // Pago
        return this.validarDatosPago();
      default:
        return false;
    }
  }

  // 🟦 Obtener texto del paso actual
  getTextoPasoActual(): string {
    const textos = [
      'Revisión del carrito',
      'Datos de envío',
      'Método de pago',
      'Confirmación de compra'
    ];
    return textos[this.pasoActual] || '';
  }

  // 🟦 Obtener porcentaje de progreso
  getPorcentajeProgreso(): number {
    return ((this.pasoActual + 1) / this.pasosCheckout.length) * 100;
  }
}