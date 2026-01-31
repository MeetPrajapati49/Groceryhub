import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../core/api.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private itemsSubject = new BehaviorSubject<any[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private api: ApiService) {
    this.load();
  }

  getSnapshot() { return this.itemsSubject.value; }

  private load() {
    this.api.get<{ items: any[] }>('/wishlist').subscribe({
      next: res => this.itemsSubject.next(res?.items || []),
      error: () => {
        const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
        this.itemsSubject.next(local);
      }
    });
  }

  add(product: any) {
    const items = [...this.itemsSubject.value];
    const exists = items.find(i => i?._id === product._id || i === product);
    if (!exists) items.push(product);
    this.itemsSubject.next(items);
    localStorage.setItem('wishlist', JSON.stringify(items));

    this.api.post('/wishlist/add', { productId: product._id }).subscribe({ error: () => this.load() });
  }

  remove(productId: string) {
    const items = this.itemsSubject.value.filter(i => i?._id !== productId);
    this.itemsSubject.next(items);
    localStorage.setItem('wishlist', JSON.stringify(items));
    this.api.post('/wishlist/remove', { productId }).subscribe({ error: () => this.load() });
  }
}
