import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  products(params?: any) { return this.api.get('/products', params); }
  getProduct(id: string) { return this.api.get(`/products/${id}`); }
  categories(params?: any) { return this.api.get('/categories', params); }
  createProduct(data: any) { return this.api.post('/products', data); }
  updateProduct(id: string, data: any) { return this.api.put(`/products/${id}`, data); }
  deleteProduct(id: string) { return this.api.delete(`/products/${id}`); }

  createCategory(data: any) { return this.api.post('/categories', data); }
  deleteCategory(id: string) { return this.api.delete(`/categories/${id}`); }

  uploadImages(formData: FormData) { return this.api.post('/admin/images/upload', formData); }

  orders(params?: any) { return this.api.get('/orders', params); }
  updateOrderStatus(id: string, status: string) { return this.api.put(`/orders/${id}/status`, { status }); }
}
