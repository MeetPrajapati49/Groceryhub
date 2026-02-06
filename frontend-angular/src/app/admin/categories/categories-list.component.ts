import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-categories-list',
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
        <a class="admin-nav-item active" routerLink="/admin/categories">
          <span>🏷️</span> Categories
        </a>
        <a class="admin-nav-item" routerLink="/admin/orders">
          <span>🛒</span> Orders
        </a>
      </aside>

      <!-- Main Content -->
      <main class="admin-content">
        <div class="admin-header">
          <h1>Categories</h1>
          <p>Organize your products into categories</p>
        </div>

        <div class="actions-bar">
          <div></div>
          <button class="btn-primary" (click)="create()">➕ Add Category</button>
        </div>

        <div *ngIf="loading" style="text-align:center;padding:40px">
          <div class="loading-spinner"></div>
          <p class="muted" style="margin-top:12px">Loading categories...</p>
        </div>

        <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
          <div *ngFor="let c of categories" class="stat-card" style="justify-content:space-between">
            <div style="display:flex;align-items:center;gap:12px">
              <div class="stat-icon accent">🏷️</div>
              <div>
                <h4 style="margin:0;font-weight:600">{{c.name}}</h4>
                <p class="muted" style="margin:4px 0 0 0;font-size:13px">{{c.slug || 'no-slug'}}</p>
              </div>
            </div>
            <div class="table-actions">
              <button class="btn-ghost btn-sm" (click)="edit(c)">✏️</button>
              <button class="btn-danger btn-sm" (click)="del(c)">🗑️</button>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && categories.length === 0" style="text-align:center;padding:40px">
          <p class="muted">No categories yet. Add your first category!</p>
        </div>
      </main>
    </div>
  `
})
export class AdminCategoriesListComponent implements OnInit {
  categories: any[] = [];
  loading = true;
  constructor(private admin: AdminService, private router: Router) { }
  ngOnInit(): void { this.load(); }
  load() { this.admin.categories().subscribe({ next: (res: any) => { this.categories = res || []; this.loading = false; }, error: () => this.loading = false }); }
  create() { this.router.navigate(['/admin/categories/new']); }
  edit(c: any) { alert('Edit category not implemented yet'); }
  del(c: any) { if (!confirm('Delete this category?')) return; if (!c._id) return alert('Category id missing'); this.admin.deleteCategory(c._id).subscribe({ next: () => this.load(), error: (err) => alert(err?.error?.message || 'Failed to delete') }); }
}
