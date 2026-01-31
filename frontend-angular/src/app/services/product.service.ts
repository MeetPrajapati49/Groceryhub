import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  list(params?: any) {
    // sanitize search param to basic alphanumeric and spaces
    if (params?.search) params.search = String(params.search).replace(/[^a-z0-9\s\-\_]/gi, '');
    return this.api.get('/products', params);
  }

  get(id: string) { return this.api.get(`/products/${id}`); }

  create(product: any) { return this.api.post('/products', product); }
  update(id: string, product: any) { return this.api.put(`/products/${id}`, product); }
  delete(id: string) { return this.api.delete(`/products/${id}`); }
}
