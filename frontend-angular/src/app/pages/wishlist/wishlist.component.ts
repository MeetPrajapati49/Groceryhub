import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-wishlist',
  template: `
    <div class="container">
      <h2>My Wishlist</h2>
      <div *ngIf="items.length===0">Your wishlist is empty.</div>
      <div *ngIf="items.length>0" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
        <div *ngFor="let p of items" class="card" style="padding:12px;display:flex;flex-direction:column;gap:8px">
          <img [src]="getImage(p)" alt="{{p.name}}" style="height:140px;object-fit:cover;width:100%" />
          <div style="font-weight:700">{{p.name}}</div>
          <div style="color:var(--muted)">₹{{p.price}}</div>
          <div style="margin-top:auto;display:flex;gap:8px">
            <button class="btn-primary" (click)="view(p._id)">View</button>
            <button (click)="remove(p._id)" style="background:none;border:1px solid var(--border);padding:8px;border-radius:6px">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  items: any[] = [];
  constructor(private wishlist: WishlistService, private router: Router) {}
  ngOnInit(): void { this.wishlist.items$.subscribe(v => this.items = v || []); }
  view(id: string) { this.router.navigate(['/product', id]); }
  remove(id: string) { this.wishlist.remove(id); }
  getImage(p: any) {
    if (!p) return '/assets/placeholder.svg';
    const candidate = (p.images && p.images.length) ? p.images[0] : (p.image || '');
    if (!candidate) return '/assets/placeholder.svg';
    // If remote URL, return as-is
    if (/^https?:\/\//.test(candidate)) return candidate;
    // Normalize path and prefer thumbnails when available
    const path = candidate.startsWith('/') ? candidate : `/${candidate}`;
    // If this is an uploads path, return backend thumbnails if possible
    if (path.startsWith('/uploads')) {
      const thumb = path.replace('/uploads/', '/uploads/thumbnails/');
      return `${environment.backendBase}${thumb}`;
    }
    // Fallback: return as provided
    return candidate;
  }
}
