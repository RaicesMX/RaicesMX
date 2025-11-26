import { Component, OnInit, OnDestroy, NO_ERRORS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Interface para las ofertas
interface Oferta {
  id: number;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  precio: number;
  descuento: number;
  imagen: string;
  categoria: string;
  artesano: string;
  region: string;
  rating: number;
  stock: number;
  vendidos: number;
  destacada: boolean;
  exclusivo: boolean;
  enFavoritos: boolean;
  fechaInicio: Date;
  fechaFin: Date;
  tiempoRestante?: {
    dias: number;
    horas: number;
    minutos: number;
  };
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ofertas.html',
  styleUrls: ['./ofertas.scss'],
  schemas: [NO_ERRORS_SCHEMA]
})
export class OfertasComponent implements OnInit, OnDestroy {
  // Lista de ofertas
  ofertas: Oferta[] = [
    {
      id: 1,
      nombre: 'Alebrije Dragón Especial',
      descripcion: 'Dragón fantástico tallado en madera con detalles en oro 24k',
      descripcionCorta: 'Dragón tallado con detalles dorados exclusivos',
      precio: 1200.00,
      descuento: 35,
      imagen: 'assets/images/ofertas/alebrije-dragon.jpg',
      categoria: 'Alebrijes',
      artesano: 'Taller Donají',
      region: 'Oaxaca',
      rating: 4.9,
      stock: 3,
      vendidos: 12,
      destacada: true,
      exclusivo: true,
      enFavoritos: true,
      fechaInicio: new Date('2024-01-20'),
      fechaFin: new Date('2024-01-27')
    },
    {
      id: 2,
      nombre: 'Textil Huichol Premium',
      descripcion: 'Manta ceremonial con chaquira y estambre de la más alta calidad',
      descripcionCorta: 'Manta ceremonial premium con materiales exclusivos',
      precio: 680.00,
      descuento: 25,
      imagen: 'assets/images/ofertas/textil-premium.jpg',
      categoria: 'Textiles',
      artesano: 'Comunidad Wixárica',
      region: 'Jalisco',
      rating: 4.8,
      stock: 8,
      vendidos: 25,
      destacada: false,
      exclusivo: false,
      enFavoritos: false,
      fechaInicio: new Date('2024-01-18'),
      fechaFin: new Date('2024-01-25')
    },
    {
      id: 3,
      nombre: 'Colección Talavera Navideña',
      descripcion: 'Set de 6 piezas de Talavera con motivos navideños tradicionales',
      descripcionCorta: 'Set navideño de Talavera poblana',
      precio: 450.00,
      descuento: 40,
      imagen: 'assets/images/ofertas/talavera-navidad.jpg',
      categoria: 'Cerámica',
      artesano: 'Alfareros de Puebla',
      region: 'Puebla',
      rating: 4.7,
      stock: 15,
      vendidos: 8,
      destacada: false,
      exclusivo: true,
      enFavoritos: false,
      fechaInicio: new Date('2024-01-15'),
      fechaFin: new Date('2024-01-22')
    },
    {
      id: 4,
      nombre: 'Joyería de Plata 50% OFF',
      descripcion: 'Colección completa de joyería en plata con descuento especial',
      descripcionCorta: 'Joyería en plata con 50% de descuento',
      precio: 320.00,
      descuento: 50,
      imagen: 'assets/images/ofertas/joyeria-plata.jpg',
      categoria: 'Platería',
      artesano: 'Plateros de Taxco',
      region: 'Guerrero',
      rating: 4.6,
      stock: 0,
      vendidos: 42,
      destacada: false,
      exclusivo: false,
      enFavoritos: true,
      fechaInicio: new Date('2024-01-10'),
      fechaFin: new Date('2024-01-20')
    },
    {
      id: 5,
      nombre: 'Barro Negro Artesanal',
      descripcion: 'Colección utilitaria en barro negro con técnicas ancestrales',
      descripcionCorta: 'Utensilios en barro negro tradicional',
      precio: 180.00,
      descuento: 30,
      imagen: 'assets/images/ofertas/barro-negro.jpg',
      categoria: 'Barro Negro',
      artesano: 'Alfareros de San Bartolo',
      region: 'Oaxaca',
      rating: 4.5,
      stock: 5,
      vendidos: 18,
      destacada: false,
      exclusivo: false,
      enFavoritos: false,
      fechaInicio: new Date('2024-01-22'),
      fechaFin: new Date('2024-01-29')
    }
  ];

  // Ofertas filtradas
  ofertasFiltradas: Oferta[] = [...this.ofertas];

  // Filtros
  filtroCategoria: string = '';
  filtroDescuento: string = '';
  ordenSeleccionado: string = 'descuento';

  // Timer
  private timer: any;

  // 🟦 Oferta destacada
  get ofertaDestacada(): Oferta | null {
    return this.ofertas.find(o => o.destacada) || null;
  }

  // 🟦 Ofertas flash (menos de 24 horas)
  get ofertasFlash(): Oferta[] {
    return this.ofertas.filter(o => {
      const horasRestantes = this.calcularHorasRestantes(o);
      return horasRestantes > 0 && horasRestantes <= 24;
    });
  }

  // 🟦 Categorías únicas
  get categoriasUnicas(): string[] {
    return [...new Set(this.ofertas.map(o => o.categoria))];
  }

  ngOnInit() {
    this.actualizarTiemposRestantes();
    this.timer = setInterval(() => {
      this.actualizarTiemposRestantes();
    }, 60000); // Actualizar cada minuto
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // 🟦 Actualizar tiempos restantes
  actualizarTiemposRestantes(): void {
    this.ofertas.forEach(oferta => {
      oferta.tiempoRestante = this.calcularTiempoRestante(oferta.fechaFin);
    });
    this.ofertasFiltradas = [...this.ofertasFiltradas];
  }

  // 🟦 Calcular tiempo restante
  calcularTiempoRestante(fechaFin: Date): { dias: number, horas: number, minutos: number } {
    const ahora = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - ahora.getTime();
    
    if (diff <= 0) {
      return { dias: 0, horas: 0, minutos: 0 };
    }
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { dias, horas, minutos };
  }

  // 🟦 Calcular horas restantes
  calcularHorasRestantes(oferta: Oferta): number {
    const tiempo = this.calcularTiempoRestante(oferta.fechaFin);
    return tiempo.dias * 24 + tiempo.horas;
  }

  // 🟦 Calcular progreso del tiempo
  calcularProgresoTiempo(oferta: Oferta): number {
    const inicio = new Date(oferta.fechaInicio).getTime();
    const fin = new Date(oferta.fechaFin).getTime();
    const ahora = new Date().getTime();
    
    const total = fin - inicio;
    const transcurrido = ahora - inicio;
    
    return Math.min(100, Math.max(0, (transcurrido / total) * 100));
  }

  // 🟦 Calcular progreso de ventas
  calcularProgresoVentas(oferta: Oferta): number {
    const maxVentas = 50; // Límite para mostrar progreso
    return Math.min(100, (oferta.vendidos / maxVentas) * 100);
  }

  // 🟦 Calcular precio con descuento
  calcularPrecioOferta(oferta: Oferta): number {
    return oferta.precio * (1 - oferta.descuento / 100);
  }

  // 🟦 Calcular ahorro por producto
  calcularAhorro(oferta: Oferta): number {
    return oferta.precio - this.calcularPrecioOferta(oferta);
  }

  // 🟦 Calcular ahorro total
  calcularAhorroTotal(): number {
    return this.ofertas.reduce((total, oferta) => {
      return total + this.calcularAhorro(oferta);
    }, 0);
  }

  // 🟦 Obtener tiempo restante general
  obtenerTiempoRestante(): string {
    const ofertaMasProxima = this.ofertas.reduce((masProxima, oferta) => {
      const tiempoActual = this.calcularHorasRestantes(oferta);
      const tiempoMasProxima = masProxima ? this.calcularHorasRestantes(masProxima) : Infinity;
      return tiempoActual < tiempoMasProxima && tiempoActual > 0 ? oferta : masProxima;
    }, null as Oferta | null);

    if (!ofertaMasProxima) return '00:00';

    const tiempo = this.calcularTiempoRestante(ofertaMasProxima.fechaFin);
    return `${tiempo.dias}d ${tiempo.horas}h`;
  }

  // 🟦 Filtrar ofertas
  filtrarOfertas(): void {
    let resultados = [...this.ofertas];

    // Filtrar por categoría
    if (this.filtroCategoria) {
      resultados = resultados.filter(o => o.categoria === this.filtroCategoria);
    }

    // Filtrar por descuento mínimo
    if (this.filtroDescuento) {
      const minDescuento = parseInt(this.filtroDescuento);
      resultados = resultados.filter(o => o.descuento >= minDescuento);
    }

    this.ofertasFiltradas = resultados;
    this.ordenarOfertas();
  }

  // 🟦 Ordenar ofertas
  ordenarOfertas(): void {
    switch (this.ordenSeleccionado) {
      case 'descuento':
        this.ofertasFiltradas.sort((a, b) => b.descuento - a.descuento);
        break;
      case 'precio':
        this.ofertasFiltradas.sort((a, b) => {
          const precioA = this.calcularPrecioOferta(a);
          const precioB = this.calcularPrecioOferta(b);
          return precioA - precioB;
        });
        break;
      case 'nuevo':
        this.ofertasFiltradas.sort((a, b) => 
          new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );
        break;
      case 'popular':
        this.ofertasFiltradas.sort((a, b) => b.vendidos - a.vendidos);
        break;
      case 'tiempo':
        this.ofertasFiltradas.sort((a, b) => {
          const tiempoA = this.calcularHorasRestantes(a);
          const tiempoB = this.calcularHorasRestantes(b);
          return tiempoA - tiempoB;
        });
        break;
    }
  }

  // 🟦 Comprar ahora
  comprarAhora(oferta: Oferta): void {
    if (oferta.stock === 0) {
      alert('Esta oferta está agotada');
      return;
    }

    // Aquí iría la lógica real de compra
    console.log('Comprando oferta:', oferta);
    alert(`Redirigiendo a compra de: ${oferta.nombre}`);
  }

  // 🟦 Ver detalles
  verDetalles(oferta: Oferta): void {
    // Aquí iría la navegación a detalles del producto
    console.log('Viendo detalles:', oferta);
    alert(`Navegando a detalles de: ${oferta.nombre}`);
  }

  // 🟦 Agregar al carrito
  agregarAlCarrito(oferta: Oferta): void {
    if (oferta.stock === 0) {
      alert('Esta oferta está agotada');
      return;
    }

    // Aquí iría la lógica real para agregar al carrito
    console.log('Agregando al carrito:', oferta);
    alert(`"${oferta.nombre}" agregado al carrito`);
  }

  // 🟦 Toggle favorito
  toggleFavorito(oferta: Oferta): void {
    oferta.enFavoritos = !oferta.enFavoritos;
    console.log('Favorito actualizado:', oferta);
  }

  // 🟦 Compartir oferta
  compartirOferta(oferta: Oferta): void {
    if (navigator.share) {
      navigator.share({
        title: `Oferta: ${oferta.nombre}`,
        text: `¡Mira esta increíble oferta! ${oferta.descripcion}`,
        url: `${window.location.origin}/ofertas/${oferta.id}`
      });
    } else {
      const url = `${window.location.origin}/ofertas/${oferta.id}`;
      navigator.clipboard.writeText(url);
      alert('Enlace de la oferta copiado al portapapeles');
    }
  }
}