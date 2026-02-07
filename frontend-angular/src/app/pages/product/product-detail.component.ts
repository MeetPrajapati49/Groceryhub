import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="!loading && product" class="container">
      <div class="card" style="display:flex;gap:20px;align-items:flex-start;">
        <div style="flex:0 0 360px">
          <img [src]="mainImage || getImageSrc(product.images)" alt="{{product.name}}" class="main-image" [class.loading]="mainImageLoading" (load)="mainImageLoading=false" />
          <div style="display:flex;gap:8px;margin-top:8px">
            <img *ngFor="let img of (product.images||[]).slice(0,6)" [src]="getImageSrc(img)" alt="thumb" class="thumb" [class.selected]="getImageSrc(img)===mainImage" (click)="setMainImage(img)" />
          </div>
        </div>
        <div style="flex:1">
          <h1 style="margin-top:0">{{product.name}}</h1>
          <p class="muted">{{product.description}}</p>
          <div style="margin-top:12px;display:flex;align-items:center;gap:12px">
            <div style="font-size:20px;font-weight:800">₹{{product.price}}</div>
            <div *ngIf="product.rating" class="muted">★ {{product.rating.average}} ({{product.rating.count}})</div>
          </div>

          <div style="margin-top:18px;display:flex;align-items:center;gap:12px">
            <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
              <button (click)="decreaseQty()" style="padding:8px 12px;border:none;background:none;cursor:pointer">-</button>
              <div style="padding:8px 14px">{{quantity}}</div>
              <button (click)="increaseQty()" style="padding:8px 12px;border:none;background:none;cursor:pointer">+</button>
            </div>
            <button class="btn-primary" (click)="addToCart()">Add to cart</button>
            <button style="border:1px solid var(--border);background:none;padding:8px 12px;border-radius:8px;cursor:pointer" (click)="addToWishlist()">♡ Add to wishlist</button>
            <button style="background:none;border:1px solid var(--border);padding:8px 12px;border-radius:8px;cursor:pointer" (click)="back()">Back</button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!loading && !product">Product not found</div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  loading = true;
  id: string | null = null;
  quantity = 1;
  mainImage: string = '/assets/placeholder.svg';
  mainImageLoading = false;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private router: Router,
    private wishlist: WishlistService,
    private toast: ToastService
  ) { }
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) { this.loading = false; return; }
    this.productService.get(this.id).subscribe({ next: (res: any) => { this.product = res; this.mainImage = this.getImageSrc(res.images || res.image || res); this.mainImageLoading = false; this.loading = false; }, error: () => { this.loading = false; } });
  }
  addToCart() {
    if (!this.product) return;
    this.cart.add(this.product, this.quantity).subscribe({
      next: () => this.toast.success('Added to cart! 🛒'),
      error: (err) => {
        if (err.error === 'AUTH_REQUIRED' || err.status === 401) {
          this.toast.warning('Please login to add items to cart');
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }, 1500);
        } else {
          this.toast.error('Failed to add to cart. Please try again.');
        }
      }
    });
  }
  addToWishlist() {
    if (!this.product) return;
    this.wishlist.add(this.product);
    this.toast.success('Added to wishlist! ❤️');
  }
  back() { this.router.navigate(['/']); }

  getImageSrc(img?: any) {
    if (!img) return '/assets/placeholder.svg';
    const val = Array.isArray(img) ? img.find((x: any) => !!x) : img;
    if (!val) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(val)) return val;
    if (val.startsWith('/uploads')) return `${environment.backendBase}${val}`;
    if (val.startsWith('uploads')) return `${environment.backendBase}/${val}`;
    return val;
  }
  increaseQty() { this.quantity++; }
  decreaseQty() { if (this.quantity > 1) this.quantity--; }

  // Set main image (handles arrays/paths) and show loading animation
  setMainImage(img: any) {
    const src = this.getImageSrc(img);
    if (!src) return;
    this.mainImageLoading = true;
    // small timeout to allow CSS transition reset when same image reselected
    this.mainImage = src;
  }
}

