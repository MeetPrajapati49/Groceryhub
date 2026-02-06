import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <h3 style="margin:0 0 20px 0;font-size:18px;color:#111827">⚙️ Admin Panel</h3>
        <a class="admin-nav-item active" routerLink="/admin">
          <span>📊</span> Dashboard
        </a>
        <a class="admin-nav-item" routerLink="/admin/products">
          <span>📦</span> Products
        </a>
        <a class="admin-nav-item" routerLink="/admin/categories">
          <span>🏷️</span> Categories
        </a>
        <a class="admin-nav-item" routerLink="/admin/orders">
          <span>🛒</span> Orders
        </a>
      </aside>

      <!-- Main Content -->
      <main class="admin-content">
        <div class="admin-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your store.</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">📦</div>
            <div class="stat-info">
              <h3>{{stats.totalProducts}}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon accent">🛒</div>
            <div class="stat-info">
              <h3>{{stats.totalOrders}}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">👥</div>
            <div class="stat-info">
              <h3>{{stats.totalUsers}}</h3>
              <p>Customers</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">💰</div>
            <div class="stat-info">
              <h3>₹{{stats.revenue | number}}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="admin-header" style="margin-top:32px">
          <h2 style="font-size:20px;margin:0 0 16px 0">Quick Actions</h2>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn-primary" (click)="go('products')">📦 Manage Products</button>
          <button class="btn-accent" (click)="go('categories')">🏷️ Manage Categories</button>
          <button class="btn-secondary" (click)="go('orders')">🛒 View Orders</button>
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = { totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 };
  constructor(private admin: AdminService, private router: Router) { }
  ngOnInit(): void {
    this.admin.products({ limit: 1 }).subscribe({ next: (res: any) => { this.stats.totalProducts = res.total || (res.products ? res.products.length : 0); }, error: () => { } });
    this.admin.orders({ limit: 100 }).subscribe({
      next: (res: any) => {
        const orders = res.orders || res;
        this.stats.totalOrders = res.pagination?.total || orders.length;
        this.stats.revenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      },
      error: () => { }
    });
    // Approximate users count
    this.stats.totalUsers = 21;
  }

  go(path: string) { this.router.navigate([`/admin/${path}`]); }
}
