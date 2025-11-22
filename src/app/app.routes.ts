import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ViewProductComponent } from './view-product/view-product';
import { PerfilComponent } from './perfil/perfil';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./marketplace/marketplace').then(m => m.MarketplaceComponent)
  },
  { path: 'producto/:id', component: ViewProductComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: '' }
];