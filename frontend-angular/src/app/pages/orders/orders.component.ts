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
        <div class="order-card" *ngFor="let o of orders" [class.expanded]="expandedOrder === o._id">
          <div class="order-header" (click)="toggleExpand(o._id)">
            <div class="order-info">
              <span class="order-id">Order #{{o._id.slice(-8).toUpperCase()}}</span>
              <span class="order-date">{{formatDate(o.createdAt)}}</span>
            </div>
            <div class="header-right">
              <span class="status-badge" [ngClass]="getStatusClass(o.status)">{{o.status}}</span>
              <span class="expand-icon">{{expandedOrder === o._id ? '▲' : '▼'}}</span>
            </div>
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

          <!-- Enhanced Timeline with Timestamps -->
          <div class="order-timeline" *ngIf="o.status !== 'Cancelled'">
            <div class="step" *ngFor="let step of timelineSteps" [class.active]="isStepActive(o.status, step)" [class.current]="o.status === step">
              <div class="dot">
                <span class="dot-check" *ngIf="isStepActive(o.status, step)">✓</span>
              </div>
              <span class="step-label">{{step === 'Pending' ? 'Ordered' : step}}</span>
              <span class="step-time" *ngIf="getStepTime(o, step)">{{getStepTime(o, step)}}</span>
            </div>
          </div>

          <div class="cancelled-banner" *ngIf="o.status === 'Cancelled'">
            <span>❌</span> This order has been cancelled
          </div>

          <!-- Expanded Details -->
          <div class="order-details" *ngIf="expandedOrder === o._id">
            <div class="detail-section">
              <h4>Items Ordered</h4>
              <div class="detail-item" *ngFor="let item of o.items">
                <img [src]="getImage(item.image)" [alt]="item.name" class="detail-img"/>
                <div class="detail-info">
                  <span class="detail-name">{{item.name}}</span>
                  <span class="detail-qty">Qty: {{item.quantity}} × ₹{{item.price}}</span>
                </div>
                <span class="detail-price">₹{{item.price * item.quantity}}</span>
              </div>
            </div>

            <div class="detail-section" *ngIf="o.deliveryAddress">
              <h4>Delivery Address</h4>
              <p class="address-text">
                {{o.deliveryAddress.street}}<br/>
                {{o.deliveryAddress.city}}, {{o.deliveryAddress.state}} {{o.deliveryAddress.pincode}}<br/>
                <span *ngIf="o.deliveryAddress.phone">📞 {{o.deliveryAddress.phone}}</span>
              </p>
            </div>

            <div class="detail-section">
              <h4>Estimated Delivery</h4>
              <p class="est-delivery">📅 {{getEstimatedDelivery(o.createdAt)}}</p>
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

    .order-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 16px; overflow: hidden; transition: box-shadow 0.3s; }
    .order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .order-card.expanded { box-shadow: 0 4px 20px rgba(0,169,165,0.15); }
    .order-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; user-select: none; }
    .order-info { display: flex; flex-direction: column; gap: 4px; }
    .order-id { font-weight: 600; font-size: 16px; }
    .order-date { color: #888; font-size: 13px; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .expand-icon { font-size: 12px; color: #888; transition: transform 0.2s; }
    
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

    /* Enhanced Timeline */
    .order-timeline { display: flex; justify-content: space-between; padding: 20px 20px 16px; background: #fafafa; border-top: 1px solid #f0f0f0; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
    .step:not(:last-child)::after { content: ''; position: absolute; top: 12px; left: 50%; width: 100%; height: 3px; background: #e0e0e0; z-index: 0; border-radius: 2px; }
    .step.active:not(:last-child)::after { background: linear-gradient(90deg, #00A9A5, #00D4D0); }
    .dot { width: 24px; height: 24px; border-radius: 50%; background: #e0e0e0; z-index: 1; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .step.active .dot { background: linear-gradient(135deg, #00A9A5, #00D4D0); box-shadow: 0 2px 8px rgba(0,169,165,0.3); }
    .step.current .dot { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 2px 8px rgba(0,169,165,0.3); } 50% { box-shadow: 0 2px 16px rgba(0,169,165,0.6); } }
    .dot-check { color: #fff; font-size: 12px; font-weight: bold; }
    .step-label { font-size: 11px; color: #888; font-weight: 500; }
    .step.active .step-label { color: #00A9A5; font-weight: 600; }
    .step-time { font-size: 10px; color: #aaa; white-space: nowrap; }
    .step.active .step-time { color: #00897B; }

    .cancelled-banner { padding: 14px 20px; background: #fff5f5; color: #c62828; font-weight: 600; text-align: center; border-top: 1px solid #ffcdd2; }

    /* Expanded Details */
    .order-details { padding: 0 20px 20px; border-top: 1px solid #f0f0f0; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
    .detail-section { padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
    .detail-section:last-child { border-bottom: none; }
    .detail-section h4 { margin: 0 0 12px; font-size: 14px; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .detail-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
    .detail-info { flex: 1; display: flex; flex-direction: column; }
    .detail-name { font-weight: 500; font-size: 14px; }
    .detail-qty { font-size: 12px; color: #888; }
    .detail-price { font-weight: 600; color: #00A9A5; }
    .address-text { margin: 0; line-height: 1.6; color: #555; font-size: 14px; }
    .est-delivery { margin: 0; font-size: 14px; color: #555; }

    @media (max-width: 600px) {
      .order-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .order-timeline { flex-wrap: wrap; gap: 12px; }
      .step::after { display: none !important; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  expandedOrder: string | null = null;
  timelineSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

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

  toggleExpand(orderId: string) {
    this.expandedOrder = this.expandedOrder === orderId ? null : orderId;
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
    const currentIndex = this.timelineSteps.indexOf(currentStatus);
    const stepIndex = this.timelineSteps.indexOf(step);
    return stepIndex <= currentIndex;
  }

  getStepTime(order: any, step: string): string | null {
    if (!order.statusHistory || !order.statusHistory.length) return null;
    const entry = order.statusHistory.find((h: any) => h.status === step);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstimatedDelivery(createdAt: string): string {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
