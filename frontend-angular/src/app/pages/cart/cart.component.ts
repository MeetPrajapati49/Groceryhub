import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  template: `
    <div class="container">
      <h1>Your Cart</h1>
      <div *ngIf="items.length===0" class="card">Your cart is empty</div>

      <div *ngFor="let it of items" class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <img [src]="getImageSrc(it.product?.images)" alt="{{it.product?.name}}" style="width:120px;height:96px;object-fit:cover;border-radius:8px" />
        <div style="flex:1">
          <div style="font-weight:700">{{it.product?.name}}</div>
          <div class="muted">₹{{it.product?.price}} each</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <button (click)="dec(it)" style="padding:6px 10px;border:none;background:none;cursor:pointer">-</button>
            <div style="padding:6px 12px">{{it.quantity}}</div>
            <button (click)="inc(it)" style="padding:6px 10px;border:none;background:none;cursor:pointer">+</button>
          </div>
          <div style="font-weight:700">₹{{it.product?.price * it.quantity}}</div>
          <button (click)="remove(it)" style="background:none;border:1px solid var(--border);padding:6px 10px;border-radius:8px;cursor:pointer">Remove</button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
        <div class="muted">Total</div>
        <div style="font-weight:800;font-size:18px">₹{{total()}}</div>
      </div>

      <div style="margin-top:16px;display:flex;gap:8px">
        <button (click)="checkout()" class="btn-primary">Proceed to Checkout</button>
        <button (click)="continueShopping()" style="background:none;border:1px solid var(--border);padding:8px 12px;border-radius:8px;cursor:pointer">Continue Shopping</button>
      </div>
    </div>
  `
})
export class CartComponent {
  items: any[] = [];
  constructor(private cart: CartService, private router: Router) { this.cart.items$.subscribe(i => this.items = i); }
  inc(i: any) {
    if (!i.product || !i.product._id) {
      alert('Product was removed from catalog and cannot be updated. Removing from cart.');
      this.cart.removeItem(i);
      return;
    }
    this.cart.update(i.product._id, i.quantity + 1);
  }
  dec(i: any) {
    if (!i.product || !i.product._id) {
      alert('Product was removed from catalog and cannot be updated. Removing from cart.');
      this.cart.removeItem(i);
      return;
    }
    if (i.quantity>1) this.cart.update(i.product._id, i.quantity -1);
  }
  remove(i: any) {
    if (!i.product || !i.product._id) {
      // product missing — remove locally
      this.cart.removeItem(i);
      return;
    }
    this.cart.remove(i.product._id);
  }
  checkout() { this.router.navigate(['/checkout']); }
  continueShopping() { this.router.navigate(['/']); }
  total() { return this.items.reduce((s:any,it:any)=>s + (it.product?.price || 0) * it.quantity, 0); }
  getImageSrc(img?: any) {
    if (!img) return '/assets/placeholder.svg';
    const val = Array.isArray(img) ? img.find((x: any) => !!x) : img;
    if (!val) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(val)) return val;
    if (val.startsWith('/uploads')) return `${environment.backendBase}${val}`;
    if (val.startsWith('uploads')) return `${environment.backendBase}/${val}`;
    return val;
  }
}
