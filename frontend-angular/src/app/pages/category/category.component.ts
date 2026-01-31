import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category',
  template: `
    <div class="container">
      <h1 class="section-title">Category: {{slug}}</h1>
      <div *ngIf="loading">Loading...</div>
      <div class="products-grid" *ngIf="!loading">
        <div class="product-card" *ngFor="let p of products">
          <img [src]="getImageSrc(p.images)" alt="{{p.name}}" class="product-image" (error)="$event.target.src='/assets/placeholder.svg'" />
          <div class="product-info">
            <h3>{{p.name}}</h3>
            <div class="product-prices">₹{{p.price}}</div>
            <button (click)="view(p._id)">View</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoryComponent implements OnInit {
  slug: string | null = null;
  products: any[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug');
    this.fetch();
  }

  getImageSrc(img?: any) {
    if (!img) return '/assets/placeholder.svg';
    const val = Array.isArray(img) ? img.find((x: any) => !!x) : img;
    if (!val) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(val)) return val;
    if (val.startsWith('/uploads')) return `${environment.backendBase}${val}`;
    if (val.startsWith('uploads')) return `${environment.backendBase}/${val}`;
    return val;
  }

  fetch() {
    const q: any = { limit: 40 };
    if (this.slug) q.category = this.slug;
    this.productService.list(q).subscribe({ next: (res:any) => { this.products = res.products || res; this.loading = false; }, error: () => { this.loading = false; } });
  }

  view(id: string) { if (id) this.router.navigate([`/product/${id}`]); }
}
