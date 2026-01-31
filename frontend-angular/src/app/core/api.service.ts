import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<T>(`${this.base}${path}`, { withCredentials: true, params: httpParams });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.base}${path}`, body, { withCredentials: true });
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.base}${path}`, body, { withCredentials: true });
  }

  delete<T>(path: string, params?: any) {
    return this.http.request<T>('delete', `${this.base}${path}`, { withCredentials: true, body: params });
  }
}
