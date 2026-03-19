import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/authentication-module/authentication/auth.guard';
import { CartComponent } from './pages/cart/cart.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { AdminGuard } from './modules/authentication-module/authentication/admin.guard';
import { ProductsConfigComponent } from './pages/products-config/products-config.component';
import { ProductsListComponent } from './pages/products-list/products-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'products-config', component: ProductsConfigComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'products-list', component: ProductsListComponent, canActivate: [AuthGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
