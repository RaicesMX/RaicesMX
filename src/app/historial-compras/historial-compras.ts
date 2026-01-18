import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ProductoCompra {
  id: number;
  nombre: string;
  imagen: string;
  precio: number;
  cantidad: number;
}

interface Compra {
  id: string;
  fecha: Date;
  estado: string;
  total: number;
  subtotal: number;
  costoEnvio: number;
  impuestos: number;
  productos: ProductoCompra[];
  direccionEnvio: string;
  metodoEnvio: string;
  metodoPago: string;
  referenciaPago: string;
  fechaPago: Date | null;
  facturaUrl: string | null;
  reembolsoSolicitado: boolean;
}

interface Resumen {
  totalCompras: number;
  totalGastado: number;
  productosComprados: number;
  comprasEsteMes: number;
}

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historial-compras.html',
  styleUrls: ['./historial-compras.scss']
})
export class HistorialCompras implements OnInit {
  // Filtros
  filtroActivo = 'todos';
  fechaInicio = '';
  fechaFin = '';
  montoMinimo: number | null = null;
  montoMaximo: number | null = null;
  
  // Vista y ordenamiento
  ordenActivo = 'fecha-desc';
  vistaActiva = 'tabla';
  cargando = false;
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  
  // Datos
  historialCompras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  compraSeleccionada: Compra | null = null;
  
  // Resumen
  resumen: Resumen = {
    totalCompras: 0,
    totalGastado: 0,
    productosComprados: 0,
    comprasEsteMes: 0
  };

  // Para usar Math en template
  Math = Math;

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;
    
    setTimeout(() => {
      this.historialCompras = this.generarDatosEjemplo();
      this.cargando = false;
      this.aplicarFiltros();
      this.calcularResumen();
    }, 1500);
  }
    
  generarDatosEjemplo(): Compra[] {
    const compras: Compra[] = [];
    const estados = ['pendiente', 'completado', 'cancelado', 'reembolsado'];
    const productos = [
      { id: 1, nombre: 'Artesanía de Barro Tradicional', imagen: 'https://via.placeholder.com/60/7A1A2C/FFFFFF?text=Artesanía', precio: 450 },
      { id: 2, nombre: 'Textil Bordado a Mano', imagen: 'https://via.placeholder.com/60/D4AF37/FFFFFF?text=Textil', precio: 320 },
      { id: 3, nombre: 'Joyería de Plata', imagen: 'https://via.placeholder.com/60/2D3748/FFFFFF?text=Joyería', precio: 780 },
      { id: 4, nombre: 'Cerámica Talavera', imagen: 'https://via.placeholder.com/60/0066CC/FFFFFF?text=Cerámica', precio: 850 },
      { id: 5, nombre: 'Máscara Artesanal', imagen: 'https://via.placeholder.com/60/38A169/FFFFFF?text=Máscara', precio: 250 },
      { id: 6, nombre: 'Sarape de Lana', imagen: 'https://via.placeholder.com/60/D69E2E/FFFFFF?text=Sarape', precio: 450 },
      { id: 7, nombre: 'Sombrero Charro', imagen: 'https://via.placeholder.com/60/E53E3E/FFFFFF?text=Sombrero', precio: 350 },
      { id: 8, nombre: 'Alebrije Pequeño', imagen: 'https://via.placeholder.com/60/3182CE/FFFFFF?text=Alebrije', precio: 250 },
      { id: 9, nombre: 'Mueble Rústico', imagen: 'https://via.placeholder.com/60/2D3748/FFFFFF?text=Mueble', precio: 3000 }
    ];
    
    const metodosPago = ['Tarjeta de crédito', 'PayPal', 'Transferencia bancaria', 'Tarjeta de débito'];
    const metodosEnvio = ['Estándar (3-5 días)', 'Express (24h)', 'Carga especial'];
    
    for (let i = 1; i <= 15; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const numProductos = Math.floor(Math.random() * 4) + 1;
      const productosCompra: ProductoCompra[] = [];
      let subtotal = 0;
      
      for (let j = 0; j < numProductos; j++) {
        const producto = productos[Math.floor(Math.random() * productos.length)];
        const cantidad = Math.floor(Math.random() * 3) + 1;
        productosCompra.push({
          ...producto,
          cantidad: cantidad,
          precio: producto.precio
        });
        subtotal += producto.precio * cantidad;
      }
      
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 90)); // Últimos 90 días
      fecha.setHours(Math.floor(Math.random() * 24));
      fecha.setMinutes(Math.floor(Math.random() * 60));
      
      const costoEnvio = estado === 'completado' || estado === 'pendiente' ? Math.floor(Math.random() * 200) + 50 : 0;
      const impuestos = subtotal * 0.16;
      const total = subtotal + costoEnvio + impuestos;
      
      compras.push({
        id: `ORD-2024-00${100 + i}`,
        fecha: fecha,
        estado: estado,
        total: total,
        subtotal: subtotal,
        costoEnvio: costoEnvio,
        impuestos: impuestos,
        productos: productosCompra,
        direccionEnvio: 'Ciudad de México, CDMX',
        metodoEnvio: metodosEnvio[Math.floor(Math.random() * metodosEnvio.length)],
        metodoPago: metodosPago[Math.floor(Math.random() * metodosPago.length)],
        referenciaPago: `TXN-${Math.floor(Math.random() * 1000000000)}`,
        fechaPago: estado !== 'pendiente' && estado !== 'cancelado' ? new Date(fecha.getTime() + 300000) : null,
        facturaUrl: estado === 'completado' || estado === 'reembolsado' ? `https://facturas.raicesmx.com/ORD-2024-00${100 + i}` : null,
        reembolsoSolicitado: estado === 'reembolsado'
      });
    }
    
    return compras.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }
  
  calcularResumen() {
    this.resumen.totalCompras = this.historialCompras.length;
    this.resumen.totalGastado = this.historialCompras
      .filter(c => c.estado === 'completado')
      .reduce((sum, compra) => sum + compra.total, 0);
    this.resumen.productosComprados = this.historialCompras
      .reduce((sum, compra) => sum + compra.productos.length, 0);
    
    const mesActual = new Date().getMonth();
    this.resumen.comprasEsteMes = this.historialCompras
      .filter(c => new Date(c.fecha).getMonth() === mesActual)
      .length;
  }
  
  contarPorEstado(estado: string): number {
    return this.historialCompras.filter(c => c.estado === estado).length;
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  filtrarPorFecha() {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  filtrarHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.filtrarPorFecha();
  }

  filtrarEstaSemana() {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
    const domingo = new Date(hoy);
    domingo.setDate(hoy.getDate() - hoy.getDay() + 7);
    
    this.fechaInicio = lunes.toISOString().split('T')[0];
    this.fechaFin = domingo.toISOString().split('T')[0];
    this.filtrarPorFecha();
  }

  filtrarEsteMes() {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.fechaInicio = primerDia.toISOString().split('T')[0];
    this.fechaFin = ultimoDia.toISOString().split('T')[0];
    this.filtrarPorFecha();
  }

  filtrarPorMonto() {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  setMontoPreset(min: number, max: number | null) {
    this.montoMinimo = min;
    this.montoMaximo = max;
    this.filtrarPorMonto();
  }

  aplicarFiltros() {
    let filtradas = [...this.historialCompras];
    
    // Filtrar por estado
    if (this.filtroActivo !== 'todos') {
      filtradas = filtradas.filter(compra => compra.estado === this.filtroActivo);
    }
    
    // Filtrar por fecha
    if (this.fechaInicio) {
      const inicio = new Date(this.fechaInicio);
      filtradas = filtradas.filter(compra => new Date(compra.fecha) >= inicio);
    }
    
    if (this.fechaFin) {
      const fin = new Date(this.fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtradas = filtradas.filter(compra => new Date(compra.fecha) <= fin);
    }
    
    // Filtrar por monto
    if (this.montoMinimo !== null) {
      filtradas = filtradas.filter(compra => compra.total >= this.montoMinimo!);
    }
    
    if (this.montoMaximo !== null) {
      filtradas = filtradas.filter(compra => compra.total <= this.montoMaximo!);
    }
    
    this.comprasFiltradas = filtradas;
    this.aplicarOrden();
  }

  aplicarOrden() {
    switch (this.ordenActivo) {
      case 'fecha-desc':
        this.comprasFiltradas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        break;
      case 'fecha-asc':
        this.comprasFiltradas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        break;
      case 'total-desc':
        this.comprasFiltradas.sort((a, b) => b.total - a.total);
        break;
      case 'total-asc':
        this.comprasFiltradas.sort((a, b) => a.total - b.total);
        break;
    }
  }

  cambiarVista(vista: string) {
    this.vistaActiva = vista;
  }

  limpiarFiltros() {
    this.filtroActivo = 'todos';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.montoMinimo = null;
    this.montoMaximo = null;
    this.ordenActivo = 'fecha-desc';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  getEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      'pendiente': 'Pendiente',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'reembolsado': 'Reembolsado'
    };
    return estados[estado] || estado;
  }

  getEstadoIcono(estado: string): string {
    const iconos: Record<string, string> = {
      'pendiente': 'fas fa-clock',
      'completado': 'fas fa-check-circle',
      'cancelado': 'fas fa-times-circle',
      'reembolsado': 'fas fa-exchange-alt'
    };
    return iconos[estado] || 'fas fa-question-circle';
  }
  
  // Paginación
  get comprasPaginadas(): Compra[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.comprasFiltradas.slice(inicio, fin);
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.comprasFiltradas.length / this.itemsPorPagina);
  }
  
  getPaginas(): number[] {
    const paginas: number[] = [];
    const total = this.totalPaginas;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      if (this.paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) paginas.push(i);
      } else if (this.paginaActual >= total - 3) {
        for (let i = total - 4; i <= total; i++) paginas.push(i);
      } else {
        for (let i = this.paginaActual - 2; i <= this.paginaActual + 2; i++) paginas.push(i);
      }
    }
    
    return paginas;
  }
  
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
  
  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
  
  irAPagina(pagina: number) {
    this.paginaActual = pagina;
  }
  
  cambiarItemsPorPagina() {
    this.paginaActual = 1;
  }
  
  // Acciones
  verDetalles(compra: Compra) {
    this.compraSeleccionada = compra;
    // En una implementación real, esto abriría un modal o navegaría a otra página
    console.log('Ver detalles:', compra);
  }
  
  cerrarDetalles() {
    this.compraSeleccionada = null;
  }
  
  verFactura(compra: Compra) {
    if (compra.facturaUrl) {
      window.open(compra.facturaUrl, '_blank');
    } else {
      alert('Factura no disponible. Se generará cuando el pedido sea completado.');
    }
  }
  
  repetirCompra(compra: Compra) {
    if (confirm(`¿Agregar los ${compra.productos.length} productos al carrito?`)) {
      alert('Productos agregados al carrito exitosamente');
    }
  }

  descargarComprobante(compra: Compra) {
    if (!compra.facturaUrl) {
      alert('Comprobante no disponible para esta compra.');
      return;
    }

    // Simulación de descarga
    const link = document.createElement('a');
    link.href = compra.facturaUrl;
    link.download = `comprobante-${compra.id}.pdf`;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Comprobante ${compra.id} descargándose...`);
  }
  
  exportarHistorial() {
    const datos = {
      resumen: this.resumen,
      compras: this.comprasFiltradas,
      fechaExportacion: new Date().toISOString(),
      filtros: {
        estado: this.filtroActivo,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin
      }
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-compras-${new Date().getTime()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Historial exportado exitosamente');
  }
}