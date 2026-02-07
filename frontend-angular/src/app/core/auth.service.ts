import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User { id: string; name?: string; email?: string; role?: string }

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadMe();
  }

  get user() { return this.userSubject.value; }

  // Get stored JWT token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Store JWT token
  private setToken(token: string | null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  loadMe() {
    // Only try to load if we have a token
    if (!this.getToken()) {
      this.userSubject.next(null);
      return;
    }
    return this.api.get<User | null>('/auth/me')
      .subscribe({
        next: (u) => this.userSubject.next(u || null),
        error: () => {
          this.setToken(null);
          this.userSubject.next(null);
        }
      });
  }

  login(email: string, password: string) {
    return this.api.post<{ user: User; token: string }>('/auth/login', { email, password })
      .pipe(tap(res => {
        this.setToken(res.token);
        this.userSubject.next(res.user);
      }));
  }

  register(name: string, email: string, password: string) {
    return this.api.post<{ user: User; token: string }>('/auth/register', { name, email, password })
      .pipe(tap(res => {
        this.setToken(res.token);
        this.userSubject.next(res.user);
      }));
  }

  logout() {
    return this.api.post('/auth/logout', {})
      .pipe(tap(() => {
        this.setToken(null);
        this.userSubject.next(null);
      }));
  }
}

