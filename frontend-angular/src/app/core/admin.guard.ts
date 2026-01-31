import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.user;
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    if (user.role !== 'admin') {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
