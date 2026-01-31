import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { HeaderComponent } from './shared/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminProductsListComponent } from './admin/products/products-list.component';
import { AdminProductFormComponent } from './admin/products/product-form.component';
import { AdminCategoriesListComponent } from './admin/categories/categories-list.component';
import { AdminCategoryFormComponent } from './admin/categories/category-form.component';
import { AdminOrdersComponent } from './admin/orders/orders.component';
import { ProductDetailComponent } from './pages/product/product-detail.component';
import { CategoryComponent } from './pages/category/category.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';

import { AuthInterceptor } from './core/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    HeaderComponent,
    AdminDashboardComponent,
    AdminProductsListComponent,
    AdminProductFormComponent,
    AdminCategoriesListComponent,
    AdminCategoryFormComponent,
    CategoryComponent,
    // admin orders
    AdminOrdersComponent
    ,ProductDetailComponent
    ,WishlistComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
