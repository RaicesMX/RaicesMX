// src/app/carrito/carrito.component.ts - VERSIÓN COMPLETA CON PAYPAL
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CartService, Cart, CartItem } from '../service/cart.service';
import { OrdersService, CreateOrderDto } from '../service/orders.service';
import { AuthService } from '../service/auth.service';
import { Subject, takeUntil } from 'rxjs';

// Declaración global de PayPal
declare const paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss'],
})
export class CarritoComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  // Datos del carrito
  carrito: Cart | null = null;
  cargando = true;

  // Estado del cupón
  codigoCupon: string = '';
  aplicandoCupon = false;

  // Estados del proceso de pago (4 pasos)
  pasosCheckout = ['carrito', 'datos', 'pago', 'confirmacion'];
  pasoActual: number = 0;

  // Datos del usuario
  datosEnvio = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México',
  };

  // Orden creada y pago
  ordenCreada: any = null;
  paypalOrderId: string = '';
  procesandoPago = false;
  ordenConfirmada: any = null;

  Math = Math;

  ngOnInit(): void {
    console.log('🛒 Carrito iniciado');

    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarCarrito();
    this.cargarDatosGuardados();

    // Verificar si viene de PayPal
    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.paypalOrderId = params['token'];
        this.procesarRetornoPayPal();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CARGAR CARRITO ====================
  cargarCarrito(): void {
    this.cargando = true;

    this.cartService
      .getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            console.log('✅ Carrito cargado:', this.carrito);

            // ✅ Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.cargando = false;
              this.cdr.detectChanges();
            }, 0);
          } else {
            this.cargando = false;
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar carrito:', error);
          this.cargando = false;
          this.mostrarNotificacion('Error al cargar el carrito');
        },
      });
  }

  // ==================== CÁLCULOS ====================
  obtenerTotalItems(): number {
    if (!this.carrito?.items) return 0;
    return this.carrito.items.reduce((total, item) => total + item.cantidad, 0);
  }

  calcularSubtotal(): number {
    return Number(this.carrito?.subtotal || 0);
  }

  calcularEnvio(): number {
    return Number(this.carrito?.envio || 0);
  }

  calcularDescuento(): number {
    return Number(this.carrito?.descuento || 0);
  }

  calcularTotal(): number {
    return Number(this.carrito?.total || 0);
  }

  get cuponAplicado(): boolean {
    return !!this.carrito?.codigoCupon;
  }

  // ==================== GESTIÓN DE ITEMS ====================
  aumentarCantidad(item: CartItem): void {
    const nuevaCantidad = item.cantidad + 1;

    if (item.product.stock < nuevaCantidad) {
      this.mostrarNotificacion(`Stock insuficiente. Solo hay ${item.product.stock} disponibles`);
      return;
    }

    this.cartService
      .updateCartItem(item.id, nuevaCantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al actualizar cantidad');
        },
      });
  }

  disminuirCantidad(item: CartItem): void {
    if (item.cantidad <= 1) {
      this.mostrarNotificacion('La cantidad mínima es 1');
      return;
    }

    const nuevaCantidad = item.cantidad - 1;

    this.cartService
      .updateCartItem(item.id, nuevaCantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al actualizar cantidad');
        },
      });
  }

  eliminarProducto(item: CartItem): void {
    if (!confirm(`¿Estás seguro de eliminar "${item.product.titulo}" del carrito?`)) {
      return;
    }

    this.cartService
      .removeCartItem(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            this.cdr.detectChanges();
            this.mostrarNotificacion('Producto eliminado del carrito');
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al eliminar producto');
        },
      });
  }

  vaciarCarrito(): void {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
      return;
    }

    this.cartService
      .clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = null;
            this.cdr.detectChanges();
            this.mostrarNotificacion('Carrito vaciado correctamente');
            this.cargarCarrito();
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al vaciar carrito');
        },
      });
  }

  // ==================== CUPONES ====================
  aplicarCupon(): void {
    if (!this.codigoCupon.trim()) {
      this.mostrarNotificacion('Por favor ingresa un código de cupón');
      return;
    }

    this.aplicandoCupon = true;

    this.cartService
      .applyCoupon(this.codigoCupon)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            this.cdr.detectChanges();
            this.mostrarNotificacion(`¡Cupón aplicado! ${response.message}`);
          }
          this.aplicandoCupon = false;
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Cupón no válido');
          this.aplicandoCupon = false;
        },
      });
  }

  removerCupon(): void {
    this.cartService
      .removeCoupon()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.carrito = response.cart;
            this.codigoCupon = '';
            this.cdr.detectChanges();
            this.mostrarNotificacion('Cupón removido');
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al remover cupón');
        },
      });
  }

  // ==================== UTILIDADES ====================
  getProductImage(item: CartItem): string {
    return this.cartService.getProductImage(item);
  }

  // ==================== NAVEGACIÓN PASOS ====================
  siguientePaso(): void {
    if (this.pasoActual < this.pasosCheckout.length - 1) {
      // Validar datos de envío en paso 1
      if (this.pasoActual === 1 && !this.validarDatosEnvio()) {
        return;
      }

      this.pasoActual++;
      this.scrollToTop();
      this.guardarDatos();

      // Si llegamos al paso de pago (paso 2), renderizar PayPal
      if (this.pasoActual === 2) {
        setTimeout(() => this.renderizarBotonPayPal(), 500);
      }
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
      this.scrollToTop();
    }
  }

  irAPaso(paso: number): void {
    // Solo permitir ir a pasos completados o al paso actual
    if (paso >= 0 && paso <= this.pasoActual && paso < this.pasosCheckout.length) {
      this.pasoActual = paso;
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== VALIDACIONES ====================
  validarDatosEnvio(): boolean {
    const datos = this.datosEnvio;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^\d{10}$/;

    if (!datos.nombre || datos.nombre.trim().length < 3) {
      this.mostrarNotificacion('Nombre inválido (mínimo 3 caracteres)');
      return false;
    }

    if (!emailRegex.test(datos.email)) {
      this.mostrarNotificacion('Correo electrónico inválido');
      return false;
    }

    if (!telefonoRegex.test(datos.telefono.replace(/\D/g, ''))) {
      this.mostrarNotificacion('Teléfono inválido (10 dígitos)');
      return false;
    }

    if (!datos.direccion || datos.direccion.trim().length < 5) {
      this.mostrarNotificacion('Dirección inválida');
      return false;
    }

    if (!datos.ciudad || datos.ciudad.trim().length < 2) {
      this.mostrarNotificacion('Ciudad inválida');
      return false;
    }

    if (!datos.estado || datos.estado.trim().length < 2) {
      this.mostrarNotificacion('Estado inválido');
      return false;
    }

    if (!/^\d{5}$/.test(datos.codigoPostal)) {
      this.mostrarNotificacion('Código postal inválido (5 dígitos)');
      return false;
    }

    return true;
  }

  // ==================== PROCESAR PAGO ====================
  procederPago(): void {
    if (!this.carrito || this.carrito.items.length === 0) {
      this.mostrarNotificacion('Tu carrito está vacío');
      return;
    }

    this.siguientePaso();
  }

  /**
   * Crear orden en backend y obtener ID de PayPal
   */
  private crearOrden(): void {
    if (!this.validarDatosEnvio()) {
      return;
    }

    this.procesandoPago = true;

    const createOrderDto: CreateOrderDto = {
      shippingDetails: this.datosEnvio,
      codigoCupon: this.carrito?.codigoCupon ?? undefined,
    };

    this.ordersService
      .createOrder(createOrderDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.ordenCreada = response.order;
            this.paypalOrderId = response.paypal.orderId;

            console.log('✅ Orden creada:', this.ordenCreada);
            console.log('🔑 PayPal Order ID:', this.paypalOrderId);

            // Redirigir a PayPal
            window.location.href = response.paypal.approveUrl;
          }
          this.procesandoPago = false;
        },
        error: (error) => {
          console.error('❌ Error al crear orden:', error);
          this.mostrarNotificacion(error.error?.message || 'Error al procesar la orden');
          this.procesandoPago = false;
        },
      });
  }

  /**
   * Renderizar botón de PayPal
   */
  private renderizarBotonPayPal(): void {
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error('❌ Contenedor de PayPal no encontrado');
      return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    if (typeof paypal === 'undefined') {
      console.error('❌ SDK de PayPal no cargado');
      this.mostrarNotificacion('Error al cargar PayPal. Recarga la página.');
      return;
    }

    paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 50,
        },

        // Crear orden
        createOrder: () => {
          if (!this.validarDatosEnvio()) {
            return Promise.reject('Datos de envío inválidos');
          }

          this.procesandoPago = true;

          const createOrderDto: CreateOrderDto = {
            shippingDetails: this.datosEnvio,
            codigoCupon: this.carrito?.codigoCupon ?? undefined,
          };

          return this.ordersService
            .createOrder(createOrderDto)
            .toPromise()
            .then((response) => {
              if (response && response.success) {
                this.ordenCreada = response.order;
                console.log('✅ Orden creada:', this.ordenCreada);
                this.procesandoPago = false;
                return response.paypal.orderId;
              }
              throw new Error('Error al crear orden');
            })
            .catch((error) => {
              console.error('❌ Error:', error);
              this.mostrarNotificacion(error.error?.message || 'Error al crear orden');
              this.procesandoPago = false;
              throw error;
            });
        },

        // Aprobar pago
        onApprove: (data: any) => {
          console.log('✅ Pago aprobado:', data);
          this.procesandoPago = true;

          return this.ordersService
            .capturePayment(data.orderID)
            .toPromise()
            .then((response) => {
              if (response && response.success) {
                console.log('✅ Pago capturado:', response);
                this.ordenConfirmada = response.order;
                this.pasoActual = 3; // Ir a confirmación
                this.procesandoPago = false;
                this.cdr.detectChanges();
                this.mostrarNotificacion('¡Pago procesado exitosamente!');
                localStorage.removeItem('checkoutProgreso');
              }
            })
            .catch((error) => {
              console.error('❌ Error al capturar pago:', error);
              this.mostrarNotificacion('Error al procesar el pago');
              this.procesandoPago = false;
            });
        },

        // Cancelar pago
        onCancel: () => {
          console.log('⚠️ Pago cancelado por el usuario');
          this.mostrarNotificacion('Pago cancelado');
          this.procesandoPago = false;
        },

        // Error en pago
        onError: (err: any) => {
          console.error('❌ Error en PayPal:', err);
          this.mostrarNotificacion('Error al procesar el pago con PayPal');
          this.procesandoPago = false;
        },
      })
      .render('#paypal-button-container');

    console.log('✅ Botón de PayPal renderizado');
  }

  /**
   * Procesar retorno de PayPal (cuando usuario aprueba)
   */
  private procesarRetornoPayPal(): void {
    console.log('🔄 Procesando retorno de PayPal:', this.paypalOrderId);
    this.procesandoPago = true;

    this.ordersService
      .capturePayment(this.paypalOrderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.ordenConfirmada = response.order;
            this.pasoActual = 3;
            this.procesandoPago = false;
            this.cdr.detectChanges();
            this.mostrarNotificacion('¡Pago procesado exitosamente!');
            localStorage.removeItem('checkoutProgreso');

            // Limpiar URL
            this.router.navigate([], {
              queryParams: {},
              replaceUrl: true,
            });
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.mostrarNotificacion('Error al procesar el pago');
          this.procesandoPago = false;
          this.pasoActual = 2;
        },
      });
  }

  // ==================== GUARDAR/CARGAR DATOS ====================
  private guardarDatos(): void {
    const progreso = {
      pasoActual: this.pasoActual,
      datosEnvio: this.datosEnvio,
    };
    localStorage.setItem('checkoutProgreso', JSON.stringify(progreso));
  }

  private cargarDatosGuardados(): void {
    const progresoGuardado = localStorage.getItem('checkoutProgreso');
    if (progresoGuardado) {
      try {
        const progreso = JSON.parse(progresoGuardado);
        this.pasoActual = progreso.pasoActual || 0;
        this.datosEnvio = progreso.datosEnvio || this.datosEnvio;
      } catch (e) {
        console.error('Error al cargar progreso:', e);
      }
    }
  }

  // ==================== UTILIDADES UI ====================
  reiniciarCompra(): void {
    if (confirm('¿Deseas comenzar una nueva compra?')) {
      this.pasoActual = 0;
      this.datosEnvio = {
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: 'México',
      };
      this.ordenConfirmada = null;
      this.ordenCreada = null;
      localStorage.removeItem('checkoutProgreso');
      this.router.navigate(['/marketplace']);
    }
  }

  getTextoPasoActual(): string {
    const textos = [
      'Revisión del carrito',
      'Datos de envío',
      'Método de pago',
      'Confirmación de compra',
    ];
    return textos[this.pasoActual] || '';
  }

  getPorcentajeProgreso(): number {
    return ((this.pasoActual + 1) / this.pasosCheckout.length) * 100;
  }

  mostrarNotificacion(mensaje: string): void {
    const notification = document.createElement('div');
    notification.textContent = mensaje;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #9D2235;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      max-width: 300px;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
