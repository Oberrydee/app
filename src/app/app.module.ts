import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthTokenInterceptor } from './modules/authentication-module/authentication/auth-token.interceptor';
import { ProductComponent } from './modules/components/product/product.component';
import { RegisterComponent } from './modules/authentication-module/register/register.component';
import { CartComponent } from './pages/cart/cart.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { ProductsListComponent } from './pages/products-list/products-list.component';
import { ProductsConfigComponent } from './pages/products-config/products-config.component';
import { PDialogComponent } from './shared/p-dialog/p-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    CartComponent,
    ProductComponent,
    WishlistComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    ProductsListComponent,
    ProductsConfigComponent,
    PDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
