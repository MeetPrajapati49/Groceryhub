import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminProductsListComponent } from './admin/products/products-list.component';
import { AdminProductFormComponent } from './admin/products/product-form.component';
import { AdminCategoriesListComponent } from './admin/categories/categories-list.component';
import { AdminCategoryFormComponent } from './admin/categories/category-form.component';
import { AdminOrdersComponent } from './admin/orders/orders.component';
import { CategoryComponent } from './pages/category/category.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:slug', component: CategoryComponent },
  { path: 'product/:id', loadComponent: () => import('./pages/product/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin/products', component: AdminProductsListComponent, canActivate: [AdminGuard] },
  { path: 'admin/products/new', component: AdminProductFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/products/edit/:id', component: AdminProductFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/categories', component: AdminCategoriesListComponent, canActivate: [AdminGuard] },
  { path: 'admin/categories/new', component: AdminCategoryFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
