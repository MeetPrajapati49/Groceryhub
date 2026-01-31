import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-categories-list',
  template: `
    <div>
      <h2>Categories</h2>
      <button (click)="create()" class="auth-button">New Category</button>
      <div *ngIf="loading">Loading...</div>
      <ul *ngIf="!loading">
        <li *ngFor="let c of categories" style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-top:1px solid #eee">
          <div>{{c.name}}</div>
          <div style="display:flex;gap:8px">
            <button (click)="edit(c)" class="auth-button">Edit</button>
            <button (click)="del(c)" style="color:#dc2626">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class AdminCategoriesListComponent implements OnInit {
  categories: string[] = [];
  loading = true;
  constructor(private admin: AdminService, private router: Router) {}
  ngOnInit(): void { this.load(); }
  load() { this.admin.categories().subscribe({ next: (res:any) => { this.categories = res || []; this.loading = false; }, error: () => this.loading = false }); }
  create() { this.router.navigate(['/admin/categories/new']); }
  edit(c: any) { /* placeholder - no edit route implemented yet */ alert('Edit category not implemented yet'); }
  del(c: any) { if (!confirm('Delete category?')) return; if (!c._id) return alert('Category id missing'); this.admin.deleteCategory(c._id).subscribe({ next: () => this.load(), error: (err) => alert(err?.error?.message || 'Failed to delete') }); }
}
