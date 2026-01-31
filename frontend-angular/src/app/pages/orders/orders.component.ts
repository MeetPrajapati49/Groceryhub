import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-orders',
  template: `
    <div class="orders-container">
      <h1>My Orders</h1>
      
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <div class="empty" *ngIf="!loading && orders.length === 0">
        <div class="empty-icon">📦</div>
        <h3>No Orders Yet</h3>
        <p>Start shopping to see your orders here</p>
        <a href="/products" class="btn-shop">Browse Products</a>
      </div>

      <div class="orders-list" *ngIf="!loading && orders.length > 0">
        <div class="order-card" *ngFor="let o of orders">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">Order #{{o._id.slice(-8).toUpperCase()}}</span>
              <span class="order-date">{{formatDate(o.createdAt)}}</span>
            </div>
            <span class="status-badge" [ngClass]="getStatusClass(o.status)">{{o.status}}</span>
          </div>

          <div class="order-items">
            <div class="item-thumb" *ngFor="let item of o.items.slice(0, 4)">
              <img [src]="getImage(item.image)" [alt]="item.name" />
            </div>
            <div class="more-items" *ngIf="o.items.length > 4">+{{o.items.length - 4}}</div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="label">Total</span>
              <span class="amount">₹{{o.totalAmount}}</span>
            </div>
            <div class="order-meta">
              <span class="payment-method">{{o.paymentMethod}}</span>
              <span class="item-count">{{o.items.length}} item{{o.items.length > 1 ? 's' : ''}}</span>
            </div>
          </div>

          <div class="order-timeline" *ngIf="o.status !== 'Cancelled'">
            <div class="step" [class.active]="isStepActive(o.status, 'Pending')">
              <div class="dot"></div>
              <span>Ordered</span>
            </div>
            <div class="step" [class.active]="isStepActive(o.status, 'Processing')">
              <div class="dot"></div>
              <span>Processing</span>
            </div>
            <div class="step" [class.active]="isStepActive(o.status, 'Shipped')">
              <div class="dot"></div>
              <span>Shipped</span>
            </div>
            <div class="step" [class.active]="isStepActive(o.status, 'Delivered')">
              <div class="dot"></div>
              <span>Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { max-width: 800px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 24px; font-size: 28px; }
    
    .loading, .empty { text-align: center; padding: 60px 20px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #eee; border-top-color: #00A9A5; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty h3 { margin: 0 0 8px; }
    .empty p { color: #888; margin: 0 0 24px; }
    .btn-shop { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #00A9A5, #00D4D0); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }

    .order-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 16px; overflow: hidden; }
    .order-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .order-info { display: flex; flex-direction: column; gap: 4px; }
    .order-id { font-weight: 600; font-size: 16px; }
    .order-date { color: #888; font-size: 13px; }
    
    .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-processing { background: #cce5ff; color: #004085; }
    .status-shipped { background: #d4edda; color: #155724; }
    .status-delivered { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }

    .order-items { display: flex; gap: 8px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
    .item-thumb img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
    .more-items { width: 50px; height: 50px; border-radius: 8px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; font-weight: 600; }

    .order-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
    .order-total .label { color: #888; font-size: 13px; margin-right: 8px; }
    .order-total .amount { font-size: 20px; font-weight: 700; color: #00A9A5; }
    .order-meta { display: flex; gap: 16px; color: #888; font-size: 13px; }
    .payment-method { background: #f5f5f5; padding: 4px 10px; border-radius: 4px; }

    .order-timeline { display: flex; justify-content: space-between; padding: 16px 20px; background: #fafafa; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
    .step:not(:last-child)::after { content: ''; position: absolute; top: 8px; left: 50%; width: 100%; height: 2px; background: #ddd; z-index: 0; }
    .step.active:not(:last-child)::after { background: #00A9A5; }
    .dot { width: 16px; height: 16px; border-radius: 50%; background: #ddd; z-index: 1; }
    .step.active .dot { background: #00A9A5; }
    .step span { font-size: 11px; color: #888; }
    .step.active span { color: #00A9A5; font-weight: 600; }

    @media (max-width: 600px) {
      .order-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .order-timeline { flex-wrap: wrap; gap: 12px; }
      .step::after { display: none; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private order: OrderService) { }

  ngOnInit(): void {
    this.order.myOrders().subscribe({
      next: (res: any) => {
        this.orders = res.orders || res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getImage(img?: string): string {
    if (!img) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith('/uploads')) return `${environment.backendBase}${img}`;
    return img;
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  isStepActive(currentStatus: string, step: string): boolean {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  }
}
