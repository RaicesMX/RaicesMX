import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Si usas routerLink

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],  // Añade esto si usas routerLink en el footer
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();  // ← Así está bien (público por defecto)
}