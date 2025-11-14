// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { MarketplaceComponent } from './marketplace/marketplace';
import { ProductDetailComponent } from './product-detail/product-detail';


export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
{ path: 'marketplace',
  loadComponent:() => import('./marketplace/marketplace')
  .then(m =>MarketplaceComponent)
},
  { path: 'producto/:id', component: ProductDetailComponent },

  { path: '**', redirectTo: '' }
];