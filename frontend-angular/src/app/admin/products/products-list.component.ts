import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-products-list',
  template: `
    <div>
      <h2>Products</h2>
      <button (click)="create()" class="auth-button">New Product</button>
      <div *ngIf="loading">Loading...</div>
      <table *ngIf="!loading" style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead><tr><th style="text-align:left">Name</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of products" style="border-top:1px solid #eee">
            <td>{{p.name}}</td>
            <td>₹{{p.price}}</td>
            <td>
              <button (click)="edit(p._id)">Edit</button>
              <button (click)="del(p._id)" style="color:#dc2626">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminProductsListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  constructor(private admin: AdminService, private router: Router) {}
  ngOnInit(): void { this.load(); }
  load() { this.admin.products({ limit: 100 }).subscribe({ next: (res:any) => { this.products = res.products || res; this.loading = false; }, error: () => this.loading = false }); }
  create() { this.router.navigate(['/admin/products/new']); }
  edit(id: string) { this.router.navigate([`/admin/products/edit/${id}`]); }
  del(id: string) { if (!confirm('Delete product?')) return; this.admin.deleteProduct(id).subscribe({ next: () => this.load(), error: () => alert('Delete failed') }); }
}
