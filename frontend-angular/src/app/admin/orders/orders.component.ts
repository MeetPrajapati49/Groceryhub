import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <h3 style="margin:0 0 20px 0;font-size:18px;color:#111827">⚙️ Admin Panel</h3>
        <a class="admin-nav-item" routerLink="/admin">
          <span>📊</span> Dashboard
        </a>
        <a class="admin-nav-item" routerLink="/admin/products">
          <span>📦</span> Products
        </a>
        <a class="admin-nav-item" routerLink="/admin/categories">
          <span>🏷️</span> Categories
        </a>
        <a class="admin-nav-item active" routerLink="/admin/orders">
          <span>🛒</span> Orders
        </a>
      </aside>

      <!-- Main Content -->
      <main class="admin-content">
        <div class="admin-header">
          <h1>Orders</h1>
          <p>Manage customer orders and track deliveries</p>
        </div>

        <div *ngIf="loading" style="text-align:center;padding:40px">
          <div class="loading-spinner"></div>
          <p class="muted" style="margin-top:12px">Loading orders...</p>
        </div>

        <table *ngIf="!loading" class="modern-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders">
              <td style="font-family:monospace;font-size:12px">{{o._id | slice:0:8}}...</td>
              <td>{{o.userId?.name || o.userId?.email || 'Guest'}}</td>
              <td style="font-weight:600">₹{{o.totalAmount}}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(o.status)">{{o.status}}</span>
              </td>
              <td>
                <div class="table-actions" style="align-items:center">
                  <select class="modern-select" [(ngModel)]="o.status">
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                  <button class="btn-primary btn-sm" (click)="updateStatus(o)">Update</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && orders.length === 0" style="text-align:center;padding:40px">
          <p class="muted">No orders yet.</p>
        </div>
      </main>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  constructor(private admin: AdminService) { }
  ngOnInit(): void { this.load(); }
  load() { this.admin.orders({ limit: 100 }).subscribe({ next: (res: any) => { this.orders = res.orders || res; this.loading = false; }, error: () => this.loading = false }); }
  updateStatus(order: any) {
    this.admin.updateOrderStatus(order._id, order.status).subscribe({
      next: () => { },
      error: () => alert('Update failed')
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'badge-pending',
      'Processing': 'badge-processing',
      'Shipped': 'badge-shipped',
      'Delivered': 'badge-delivered',
      'Cancelled': 'badge-cancelled'
    };
    return statusMap[status] || 'badge-pending';
  }
}
