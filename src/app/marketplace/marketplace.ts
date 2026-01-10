import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent]
})
export class MarketplaceComponent {
  cartItems: number = 3;
  
  productos = [
    {
      id: 1,
      nombre: 'Jarrón de Talavera Poblana',
      precio: 850,
      imagen: 'assets/images/Jarrón_Talavera.jpg'
    },
    {
      id: 2,
      nombre: 'Alebrije Artesanal',
      precio: 450,
      imagen: 'assets/images/Alebrigue_Artesanal.jpg'
    },
    {
      id: 3,
      nombre: 'Blusa Bordada Tradicional',
      precio: 380,
      imagen: 'assets/images/Blusa_Bordada.jpg'
    },
    {
      id: 4,
      nombre: 'Cerámica Talavera',
      precio: 220,
      imagen: 'assets/images/Ceramica_Talavera.jpg'
    },
    {
      id: 5,
      nombre: 'Máscara Huichol Artesanal',
      precio: 620,
      imagen: 'assets/images/Máscara_Huichol.jpg'
    },
    {
      id: 6,
      nombre: 'Plato Talavera Decorativo',
      precio: 180,
      imagen: 'assets/images/Plato_Talavera.jpg'
    }
  ];

  // 🟦 Añade el método agregarAlCarrito
  agregarAlCarrito(producto: any) {
    this.cartItems++;
    alert(`Agregado al carrito: ${producto.nombre}`);
  }

  // Fallback si no carga
  onImgError(event: any) {
    event.target.src = 'assets/images/TO.png';
  }
  
  // 🟦 Verificar página activa para resaltar en el header
  esPaginaActiva(ruta: string): boolean {
    if (typeof window !== 'undefined') {
        return window.location.pathname === ruta;
    }
    return false;
  }
}