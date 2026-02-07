import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private itemsSubject = new BehaviorSubject<any[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private api: ApiService, private auth: AuthService) {
    // Load wishlist when user changes
    this.auth.user$.subscribe(user => {
      if (user) {
        this.load();
      } else {
        this.itemsSubject.next([]);
      }
    });
  }

  getSnapshot() { return this.itemsSubject.value; }

  private load() {
    this.api.get<{ products: any[] }>('/wishlist').subscribe({
      next: res => this.itemsSubject.next(res?.products || []),
      error: () => this.itemsSubject.next([])
    });
  }

  add(product: any) {
    const items = [...this.itemsSubject.value];
    const exists = items.find(i => i?._id === product._id);
    if (!exists) items.push(product);
    this.itemsSubject.next(items);

    this.api.post('/wishlist/add', { productId: product._id }).subscribe({ error: () => this.load() });
  }

  remove(productId: string) {
    const items = this.itemsSubject.value.filter(i => i?._id !== productId);
    this.itemsSubject.next(items);
    this.api.delete(`/wishlist/${productId}`).subscribe({ error: () => this.load() });
  }
}

