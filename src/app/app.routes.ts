import { Routes } from '@angular/router';
import { MainLayout } from './shared/layouts/main-layout/main-layout';

//Importación de Components
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ViewProductComponent } from './view-product/view-product';
import { PerfilComponent } from './perfil/perfil';
import { RecuperarComponent } from './recuperar/recuperar'; 
import { CarritoComponent } from './carrito/carrito';
import { CategoriasComponent } from './categorias/categorias';
import { FavoritosComponent } from './favoritos/favoritos';
import { OfertasComponent } from './ofertas/ofertas';
import { AyudaComponent } from './ayuda/ayuda';
import { PublicarProducto } from './publicar-producto/publicar-producto';
import { HistorialCompras } from './historial-compras/historial-compras';


export const routes: Routes = [
  
  // === Grupo 1: Ruta sin HEADER y FOOTER ===
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recuperar', component: RecuperarComponent },

 // --- GRUPO 2: RUTAS CON HEADER Y FOOTER (Envueltas en el Layout) ---
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'marketplace',
        loadComponent: () => import('./marketplace/marketplace').then(m => m.MarketplaceComponent)
      },
      { path: 'producto/:id', component: ViewProductComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'carrito', component: CarritoComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'favoritos', component: FavoritosComponent },
      { path: 'ofertas', component: OfertasComponent },
      { path: 'ayuda', component: AyudaComponent },
      { path: 'publicar_producto', component: PublicarProducto},
      { path: 'historial_compras', component: HistorialCompras}
    ]
  },

  // Redirección por defecto si la ruta no existe
  { path: '**', redirectTo: '' }
];