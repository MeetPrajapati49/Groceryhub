import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  template: `
    <div>
      <h2>Orders</h2>
      <div *ngIf="loading">Loading...</div>
      <table *ngIf="!loading" style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let o of orders" style="border-top:1px solid #eee">
            <td>{{o._id}}</td>
            <td>{{o.userId?.name || o.userId?.email}}</td>
            <td>₹{{o.totalAmount}}</td>
            <td>{{o.status}}</td>
            <td>
              <select name="status-{{o._id}}" [(ngModel)]="o.status">
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <button (click)="updateStatus(o)" style="margin-left:8px">Update</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  constructor(private admin: AdminService) {}
  ngOnInit(): void { this.load(); }
  load() { this.admin.orders({ limit: 100 }).subscribe({ next: (res:any) => { this.orders = res.orders || res; this.loading = false; }, error: () => this.loading = false }); }
  updateStatus(order: any) { this.admin.updateOrderStatus(order._id, order.status).subscribe({ next: () => alert('Status updated'), error: () => alert('Update failed') }); }
}
