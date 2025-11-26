import { Routes } from '@angular/router';
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


export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recuperar', component: RecuperarComponent }, // Añade esta ruta
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./marketplace/marketplace').then(m => m.MarketplaceComponent)
  },
  { path: 'producto/:id', component: ViewProductComponent },
  { path: 'perfil', component: PerfilComponent },
  {path: 'carrito', component: CarritoComponent},
  { path: 'categorias', component: CategoriasComponent },
  { path: 'favoritos', component: FavoritosComponent },
  { path: 'ofertas', component: OfertasComponent },
  { path: '**', redirectTo: '' }
];