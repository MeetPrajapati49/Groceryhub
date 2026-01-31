import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="container">
      <h1>Admin Dashboard</h1>
      <p class="muted">Quick overview</p>
      <div style="display:flex;gap:12px;margin-bottom:18px">
        <div class="card">Products: {{stats.totalProducts}}</div>
        <div class="card">Orders: {{stats.totalOrders}}</div>
      </div>

      <div style="display:flex;gap:12px">
        <button class="btn-primary" (click)="go('products')">Manage Products</button>
        <button class="btn-primary" (click)="go('categories')">Manage Categories</button>
        <button class="btn-primary" (click)="go('orders')">Manage Orders</button>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = { totalProducts: 0, totalOrders: 0 };
  constructor(private admin: AdminService, private router: Router) {}
  ngOnInit(): void {
    this.admin.products({ limit:1 }).subscribe({ next: (res:any) => { this.stats.totalProducts = res.total || (res.products ? res.products.length : 0); }, error: () => {} });
    this.admin.orders({ limit:1 }).subscribe({ next: (res:any) => { this.stats.totalOrders = res.pagination?.total || (res.orders ? res.orders.length : 0); }, error: () => {} });
  }

  go(path: string) { this.router.navigate([`/admin/${path}`]); }
}
