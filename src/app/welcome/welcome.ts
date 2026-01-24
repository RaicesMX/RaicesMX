// OPCIÓN 2: Si usas Angular Standalone (Angular 14+)
// src/app/welcome/welcome.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // ← Importar RouterModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true, // ← Si es standalone
  imports: [
    CommonModule,
    RouterModule // ← DEBE ESTAR AQUÍ
  ],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Prevenir overflow horizontal
    if (typeof document !== 'undefined') {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Limpiar estilos al salir
    if (typeof document !== 'undefined') {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    }
  }
}