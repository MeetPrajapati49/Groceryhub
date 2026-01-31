import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  placeOrder(orderData: any) { return this.api.post('/orders', orderData); }
  myOrders() { return this.api.get('/orders/my-orders'); }
}
