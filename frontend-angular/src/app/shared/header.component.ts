import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  template: `
    <header [class.open]="showMobileMenu" class="site-header">
      <div class="container header-inner">
        <div style="display:flex;align-items:center;gap:12px">
          <button class="menu-btn" (click)="toggleMobile()">☰</button>
          <a routerLink="/" class="site-brand">GroceryHub</a>
        </div>

        <div class="search-box">
          <input [(ngModel)]="searchTerm" (keyup.enter)="doSearch()" placeholder="Search for groceries, brands, and more..." />
          <button (click)="doSearch()" style="margin-left:8px;background:none;border:none;cursor:pointer">🔍</button>
        </div>

        <nav class="header-nav">
          <a routerLink="/wishlist">❤️ Wishlist</a>
          <a routerLink="/cart">🛒 Cart</a>

          <div style="position:relative">
            <button (click)="toggleAccount()" class="account-btn">👤 Account</button>
            <div *ngIf="showAccount" class="account-menu">
              <ng-container *ngIf="user; else anonymous">
                <div style="padding:8px;border-bottom:1px solid #f3f4f6">
                  <div style="font-weight:700">{{user.name}}</div>
                  <div style="font-size:12px;color:var(--muted)">{{user.email}}</div>
                </div>
                <a routerLink="/orders" style="display:block;padding:8px 4px">My Orders</a>
                <a routerLink="/wishlist" style="display:block;padding:8px 4px">Wishlist</a>
                <a *ngIf="user?.role==='admin'" routerLink="/admin" style="display:block;padding:8px 4px">Admin Panel</a>
                <button (click)="logout()" style="margin-top:8px;width:100%;background:#ef4444;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer">Logout</button>
              </ng-container>
              <ng-template #anonymous>
                <a routerLink="/login" style="display:block;padding:8px 4px">Login</a>
                <a routerLink="/signup" style="display:block;padding:8px 4px">Register</a>
              </ng-template>
            </div>
          </div>

        </nav>
      </div>
    </header>
  `
})
export class HeaderComponent {
  user: any;
  showAccount = false;
  showMobileMenu = false;
  searchTerm = '';
  private search$ = new Subject<string>();
  private subs = new Subscription();
  constructor(private auth: AuthService, private router: Router) {
    this.auth.user$.subscribe(u => this.user = u);
    // close dropdown on navigation
    this.router.events.subscribe(e => { if (e instanceof NavigationStart) { this.showAccount = false; this.showMobileMenu = false; } });
  }
  logout() { this.auth.logout().subscribe({ next: () => this.router.navigate(['/']) }); }
  toggleAccount() { this.showAccount = !this.showAccount; }
  toggleMobile() { this.showMobileMenu = !this.showMobileMenu; }

  doSearch() {
    const q = (this.searchTerm || '').trim();
    if (!q) {
      // clear search -> navigate to home without params
      this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/'], { queryParams: { search: q } });
  }

  ngOnInit(): void {
    this.subs.add(
      this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => {
        const val = (q || '').trim();
        if (!val) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/'], { queryParams: { search: val } });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearchChange(v: string) { this.search$.next(v || ''); }
}
