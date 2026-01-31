import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User { id: string; name?: string; email?: string; role?: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadMe();
  }

  get user() { return this.userSubject.value; }

  loadMe() {
    return this.api.get<User | null>('/auth/me')
      .subscribe({
        next: (u) => this.userSubject.next(u || null),
        error: () => this.userSubject.next(null)
      });
  }

  login(email: string, password: string) {
    return this.api.post<{ user: User }>('/auth/login', { email, password })
      .pipe(tap(res => this.userSubject.next(res.user)));
  }

  register(name: string, email: string, password: string) {
    return this.api.post<{ user: User }>('/auth/register', { name, email, password })
      .pipe(tap(res => this.userSubject.next(res.user)));
  }

  logout() {
    return this.api.post('/auth/logout', {})
      .pipe(tap(() => this.userSubject.next(null)));
  }
}
