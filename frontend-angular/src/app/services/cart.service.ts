import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

export interface CartItem { product: any; quantity: number }

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private api: ApiService, private authService: AuthService, private router: Router) {
    this.load();
    // Clear any old localStorage guest cart items
    localStorage.removeItem('cart');
  }

  // Return a synchronous snapshot of current cart items
  getSnapshot(): CartItem[] {
    return this.itemsSubject.value;
  }

  private load() {
    // Only load cart if user is authenticated
    if (!this.authService.user) {
      this.itemsSubject.next([]);
      return;
    }
    this.api.get<{ items: CartItem[] }>('/cart').subscribe({
      next: res => this.itemsSubject.next(res?.items || []),
      error: () => this.itemsSubject.next([])
    });
  }

  add(product: any, quantity = 1): Observable<any> {
    // Check authentication first
    if (!this.authService.user) {
      return throwError(() => ({
        error: 'AUTH_REQUIRED',
        message: 'Please login to add items to your cart'
      }));
    }

    // Optimistic update for authenticated users
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(i => i.product?._id === product._id || i.product === product);
    if (idx >= 0) items[idx].quantity += quantity; else items.push({ product, quantity });
    this.itemsSubject.next(items);

    return new Observable(observer => {
      this.api.post('/cart/add', { productId: product._id, quantity }).subscribe({
        next: (res) => { observer.next(res); observer.complete(); },
        error: (err) => {
          this.load(); // revert optimistic update
          observer.error(err);
        }
      });
    });
  }

  update(productId: string, quantity: number) {
    if (!this.authService.user) {
      console.error('Cannot update cart: user not authenticated');
      return;
    }
    const items = this.itemsSubject.value.map(i => i.product?._id === productId ? { ...i, quantity } : i);
    this.itemsSubject.next(items);
    this.api.put('/cart/update', { productId, quantity }).subscribe({ error: () => this.load() });
  }

  remove(productId: string) {
    if (!this.authService.user) {
      console.error('Cannot remove from cart: user not authenticated');
      return;
    }
    const items = this.itemsSubject.value.filter(i => i.product?._id !== productId);
    this.itemsSubject.next(items);
    this.api.post('/cart/remove', { productId }).subscribe({ error: () => this.load() });
  }

  // Remove by item reference (or when product object is null after deletion)
  removeItem(item: CartItem) {
    if (!this.authService.user) {
      console.error('Cannot remove item from cart: user not authenticated');
      return;
    }
    const items = this.itemsSubject.value.filter(i => i !== item);
    this.itemsSubject.next(items);
  }
}
