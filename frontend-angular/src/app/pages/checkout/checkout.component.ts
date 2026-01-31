import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  template: `
    <div class="checkout-container">
      <div class="checkout-grid">
        <!-- Left: Address & Payment -->
        <div class="checkout-form">
          <h2>Checkout</h2>
          
          <div class="section">
            <h3>Delivery Address</h3>
            <input class="auth-input" [(ngModel)]="address.street" placeholder="Street Address" required />
            <div class="row">
              <input class="auth-input" [(ngModel)]="address.city" placeholder="City" required />
              <input class="auth-input" [(ngModel)]="address.state" placeholder="State" required />
            </div>
            <div class="row">
              <input class="auth-input" [(ngModel)]="address.pincode" placeholder="Pincode" required />
              <input class="auth-input" [(ngModel)]="address.phone" placeholder="Phone" required />
            </div>
          </div>

          <div class="section">
            <h3>Payment Method</h3>
            <div class="payment-options">
              <label class="payment-option" [class.selected]="payment === 'COD'">
                <input type="radio" name="payment" value="COD" [(ngModel)]="payment" />
                <span class="payment-icon cod">COD</span>
                <span>Cash on Delivery</span>
              </label>
              <label class="payment-option" [class.selected]="payment === 'Online'">
                <input type="radio" name="payment" value="Online" [(ngModel)]="payment" />
                <span class="payment-icon online">PAY</span>
                <span>Pay Online (Card/UPI/NetBanking)</span>
              </label>
            </div>
            <div *ngIf="payment === 'Online'" class="payment-logos">
              <span class="secure-badge">Secure Payment</span>
              <span>Visa | Mastercard | UPI | NetBanking</span>
            </div>
          </div>

          <div *ngIf="error" class="error-message">{{error}}</div>
          <button class="auth-button" (click)="submit()" [disabled]="loading">
            {{loading ? 'Processing...' : (payment === 'Online' ? 'Pay Now' : 'Place Order')}}
          </button>
        </div>

        <!-- Right: Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="items">
            <div *ngFor="let item of cartItems" class="item">
              <img [src]="getImage(item.product?.images?.[0])" alt="" />
              <div class="item-info">
                <div class="name">{{item.product?.name}}</div>
                <div class="qty">Qty: {{item.quantity}}</div>
              </div>
              <div class="price">₹{{(item.product?.price || 0) * item.quantity}}</div>
            </div>
          </div>
          <hr />
          <div class="summary-row"><span>Subtotal</span><span>₹{{getTotal()}}</span></div>
          <div class="summary-row"><span>Delivery</span><span class="free">FREE</span></div>
          <hr />
          <div class="summary-row total"><span>Total</span><span>₹{{getTotal()}}</span></div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div class="payment-modal" *ngIf="showPaymentModal">
        <div class="modal-backdrop" (click)="closePaymentModal()"></div>
        <div class="modal-content">
          <div class="modal-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" height="28" onerror="this.style.display='none'" />
            <span class="modal-title" *ngIf="!paymentProcessing">Secure Payment</span>
          </div>
          
          <div class="modal-body" *ngIf="!paymentProcessing">
            <div class="amount-display">
              <span class="label">Amount to Pay</span>
              <span class="amount">₹{{getTotal()}}</span>
            </div>
            
            <div class="payment-methods">
              <div class="method" [class.active]="selectedMethod === 'card'" (click)="selectedMethod = 'card'">
                <span class="method-icon">💳</span>
                <span>Card</span>
              </div>
              <div class="method" [class.active]="selectedMethod === 'upi'" (click)="selectedMethod = 'upi'">
                <span class="method-icon">📱</span>
                <span>UPI</span>
              </div>
              <div class="method" [class.active]="selectedMethod === 'netbanking'" (click)="selectedMethod = 'netbanking'">
                <span class="method-icon">🏦</span>
                <span>NetBanking</span>
              </div>
            </div>

            <div class="demo-input" *ngIf="selectedMethod === 'card'">
              <input type="text" placeholder="Card Number" value="4111 1111 1111 1111" readonly />
              <div class="row">
                <input type="text" placeholder="MM/YY" value="12/26" readonly />
                <input type="text" placeholder="CVV" value="123" readonly />
              </div>
            </div>

            <div class="demo-input" *ngIf="selectedMethod === 'upi'">
              <input type="text" placeholder="Enter UPI ID" value="demo@upi" readonly />
            </div>

            <div class="demo-input" *ngIf="selectedMethod === 'netbanking'">
              <select><option>Select Bank</option><option selected>Demo Bank</option></select>
            </div>
          </div>

          <div class="modal-body processing" *ngIf="paymentProcessing">
            <div class="spinner"></div>
            <p>Processing Payment...</p>
          </div>

          <div class="modal-footer" *ngIf="!paymentProcessing">
            <button class="btn-cancel" (click)="closePaymentModal()">Cancel</button>
            <button class="btn-pay" (click)="processPayment()">Pay ₹{{getTotal()}}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .checkout-grid { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
    .checkout-form { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section { margin-bottom: 24px; }
    .section h3 { margin: 0 0 12px; font-size: 16px; }
    .row { display: flex; gap: 12px; }
    .row input { flex: 1; }
    .auth-input { width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .payment-options { display: flex; flex-direction: column; gap: 12px; }
    .payment-option { display: flex; align-items: center; gap: 12px; padding: 14px; border: 2px solid #eee; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .payment-option:hover { border-color: #00A9A5; }
    .payment-option.selected { border-color: #00A9A5; background: #f0fdfc; }
    .payment-option input { display: none; }
    .payment-icon { padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .payment-icon.cod { background: #e8f5e9; color: #2e7d32; }
    .payment-icon.online { background: #e3f2fd; color: #1565c0; }
    .payment-logos { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 12px; background: #f9f9f9; border-radius: 8px; font-size: 12px; color: #666; }
    .secure-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .auth-button { width: 100%; padding: 14px; background: linear-gradient(135deg, #00A9A5, #00D4D0); color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .auth-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .order-summary { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); height: fit-content; }
    .order-summary h3 { margin: 0 0 16px; }
    .items { max-height: 300px; overflow-y: auto; }
    .item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .item img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; }
    .item .name { font-weight: 500; font-size: 14px; }
    .item .qty { color: #888; font-size: 12px; }
    .item .price { font-weight: 600; }
    hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .summary-row.total { font-size: 18px; font-weight: 700; margin-top: 8px; }
    .free { color: #00A9A5; font-weight: 600; }
    .error-message { color: #e74c3c; margin-bottom: 12px; padding: 10px; background: #ffeaea; border-radius: 8px; }
    @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } }
    
    /* Payment Modal */
    .payment-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-backdrop { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); }
    .modal-content { position: relative; background: #fff; width: 400px; max-width: 90%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .modal-header { background: linear-gradient(135deg, #2b3a67, #1a2540); color: #fff; padding: 20px; display: flex; align-items: center; gap: 12px; }
    .modal-title { font-size: 18px; font-weight: 600; }
    .modal-body { padding: 24px; }
    .modal-body.processing { text-align: center; padding: 60px 24px; }
    .amount-display { text-align: center; margin-bottom: 24px; }
    .amount-display .label { display: block; color: #888; font-size: 14px; margin-bottom: 4px; }
    .amount-display .amount { font-size: 32px; font-weight: 700; color: #1a2540; }
    .payment-methods { display: flex; gap: 12px; margin-bottom: 20px; }
    .method { flex: 1; padding: 16px 12px; border: 2px solid #eee; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .method:hover { border-color: #00A9A5; }
    .method.active { border-color: #00A9A5; background: #f0fdfc; }
    .method-icon { display: block; font-size: 24px; margin-bottom: 4px; }
    .demo-input input, .demo-input select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 12px; box-sizing: border-box; background: #f9f9f9; }
    .demo-input .row { display: flex; gap: 12px; }
    .demo-input .row input { flex: 1; }
    .modal-footer { padding: 16px 24px; background: #f9f9f9; display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { padding: 12px 24px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .btn-pay { padding: 12px 32px; background: linear-gradient(135deg, #00A9A5, #00D4D0); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .spinner { width: 48px; height: 48px; border: 4px solid #eee; border-top-color: #00A9A5; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CheckoutComponent implements OnInit {
  address = { street: '', city: '', state: '', pincode: '', phone: '' };
  payment = 'COD';
  error: string | null = null;
  loading = false;
  cartItems: CartItem[] = [];

  // Payment Modal State
  showPaymentModal = false;
  paymentProcessing = false;
  selectedMethod = 'card';

  constructor(
    private cart: CartService,
    private order: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cart.items$.subscribe(items => this.cartItems = items);
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  }

  getImage(img?: string): string {
    if (!img) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith('/uploads')) return `${environment.backendBase}${img}`;
    if (img.startsWith('uploads')) return `${environment.backendBase}/${img}`;
    return img;
  }

  submit() {
    if (!this.address.street || !this.address.city || !this.address.phone) {
      this.error = 'Please fill all address fields';
      return;
    }

    const missing = this.cartItems.filter(it => !it.product || !it.product._id);
    if (missing.length) {
      missing.forEach(it => this.cart.removeItem(it));
      this.error = 'Some items were removed. Please review your cart.';
      return;
    }

    if (this.payment === 'Online') {
      this.initiateRazorpay();
    } else {
      this.placeOrder('COD', null);
    }
  }

  initiateRazorpay() {
    // Show the payment modal instead of browser dialog
    this.showPaymentModal = true;
    this.paymentProcessing = false;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentProcessing = false;
    this.loading = false;
  }

  processPayment() {
    this.paymentProcessing = true;

    // Simulate payment processing
    setTimeout(() => {
      this.showPaymentModal = false;
      this.paymentProcessing = false;
      this.placeOrder('Online', 'PAY_' + Date.now());
    }, 2000);
  }

  placeOrder(method: string, paymentId: string | null) {
    this.loading = true;
    const orderData = {
      items: this.cartItems.map(it => ({
        productId: it.product._id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        image: this.getImage(it.product.images?.[0])
      })),
      totalAmount: this.getTotal(),
      deliveryAddress: this.address,
      paymentMethod: method,
      paymentId: paymentId
    };

    this.order.placeOrder(orderData).subscribe({
      next: () => {
        this.loading = false;
        alert(method === 'Online' ? 'Payment successful! Order placed.' : 'Order placed successfully!');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to place order';
      }
    });
  }
}

