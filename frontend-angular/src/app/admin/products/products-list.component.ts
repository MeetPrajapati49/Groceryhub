import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-products-list',
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <h3 style="margin:0 0 20px 0;font-size:18px;color:#111827">⚙️ Admin Panel</h3>
        <a class="admin-nav-item" routerLink="/admin">
          <span>📊</span> Dashboard
        </a>
        <a class="admin-nav-item active" routerLink="/admin/products">
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
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>

        <div class="actions-bar">
          <div></div>
          <button class="btn-primary" (click)="create()">➕ Add New Product</button>
        </div>

        <div *ngIf="loading" style="text-align:center;padding:40px">
          <div class="loading-spinner"></div>
          <p class="muted" style="margin-top:12px">Loading products...</p>
        </div>

        <table *ngIf="!loading" class="modern-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td style="font-weight:500">{{p.name}}</td>
              <td><span class="badge badge-processing">{{p.category}}</span></td>
              <td>₹{{p.price}}</td>
              <td>{{p.stock || 0}}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-ghost btn-sm" (click)="edit(p._id)">✏️ Edit</button>
                  <button class="btn-danger btn-sm" (click)="del(p._id)">🗑️ Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && products.length === 0" style="text-align:center;padding:40px">
          <p class="muted">No products found. Add your first product!</p>
        </div>
      </main>
    </div>
  `
})
export class AdminProductsListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  constructor(private admin: AdminService, private router: Router) { }
  ngOnInit(): void { this.load(); }
  load() { this.admin.products({ limit: 100 }).subscribe({ next: (res: any) => { this.products = res.products || res; this.loading = false; }, error: () => this.loading = false }); }
  create() { this.router.navigate(['/admin/products/new']); }
  edit(id: string) { this.router.navigate([`/admin/products/edit/${id}`]); }
  del(id: string) { if (!confirm('Delete this product?')) return; this.admin.deleteProduct(id).subscribe({ next: () => this.load(), error: () => alert('Delete failed') }); }
}
