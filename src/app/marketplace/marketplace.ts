// src/app/marketplace/marketplace.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MarketplaceComponent {
  productos = [
    {
      nombre: 'Alebrije Artesanal',
      precio: 450,
      imagen: 'assets/images/Alebrigue_Artesanal.jpg'
    },
    {
      nombre: 'Blusa Bordada',
      precio: 380,
      imagen: 'assets/images/Blusa_Bordada.jpg'
    },
    {
      nombre: 'Cerámica Talavera',
      precio: 220,
      imagen: 'assets/images/Ceramica_Talavera.jpg'
    },
    {
      nombre: 'Jarrón Talavera',
      precio: 520,
      imagen: 'assets/images/Jarrón_Talavera.jpg'
    },
    {
      nombre: 'Plato Talavera',
      precio: 180,
      imagen: 'assets/images/Plato_Talavera.jpg'
    },
    {
      nombre: 'Máscara Huichol',
      precio: 680,
      imagen: 'assets/images/Máscara_Huichol.jpg'
    }
  ];

  // Fallback si no carga
  onImgError(event: any) {
    event.target.src = 'assets/images/TO.png'; // Usa esta imagen como respaldo
  }
}