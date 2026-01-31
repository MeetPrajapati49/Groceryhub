import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
<div class="top-bar">
  <div class="container top-bar-inner">
    <div>📍 Deliver to <span class="location">Your Location</span></div>
    <div class="top-right">🎊 Festive Sale Live! · Free Delivery on Orders ₹299+</div>
  </div>
</div>

<!-- header removed: using shared app-header component instead -->

<nav class="nav container">
  <a routerLink="/" class="nav-item">All Categories</a>
  <a routerLink="/category/vegetables" class="nav-item">Vegetables</a>
  <a routerLink="/category/fruits" class="nav-item">Fruits</a>
  <a routerLink="/category/dairy" class="nav-item">Dairy</a>
  <a routerLink="/category/bakery" class="nav-item">Bakery</a>
  <a routerLink="/category/meat" class="nav-item">Meat</a>
  <a routerLink="/category/snacks" class="nav-item">Snacks</a>
</nav>

<section class="hero-section">
  <div class="slideshow-container full-width">
    <div class="slideshow" [style.transform]="'translateX(-' + (currentSlideIndex * 100) + '%)'"><!--inline-->
      <div class="slide" *ngFor="let s of slides">
        <img [src]="s.image" alt="slide" />
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <h2>{{s.title}}</h2>
          <p>{{s.subtitle}}</p>
          <button class="slide-btn">{{s.buttonText}}</button>
        </div>
      </div>
    </div>
    <button class="nav-btn prev" (click)="previousSlide()">‹</button>
    <button class="nav-btn next" (click)="nextSlide()">›</button>
    <div class="indicators">
      <button *ngFor="let _ of slides; let i = index" class="indicator" [class.active]="i === currentSlideIndex" (click)="showSlide(i)"></button>
    </div>
  </div>
</section>

<section class="flash-sale container">
  <div class="flash-left">
    <div class="flash-icon">⚡</div>
    <div>
      <h3>Flash Sale</h3>
      <p>Limited time offers - Grab them now!</p>
    </div>
  </div>
  <div class="timer">
    <div class="timer-box">{{timeLeft.hours | number:'2.0'}}</div>
    <span>:</span>
    <div class="timer-box">{{timeLeft.minutes | number:'2.0'}}</div>
    <span>:</span>
    <div class="timer-box">{{timeLeft.seconds | number:'2.0'}}</div>
  </div>
</section>

<section class="products-section container">
  <h2 class="section-title">Featured</h2>
  <div class="products-grid">
    <div class="product-card" *ngFor="let product of products.slice(0,4)">
      <div class="discount-badge">20% OFF</div>
      <img [src]="getImageSrc(product.images)" alt="{{product.name}}" class="product-image" (error)="$event.target.src='/assets/placeholder.svg'" />
      <div class="product-info">
        <h3 class="product-name">{{product.name}}</h3>
        <div class="product-prices">
          <span class="sale-price">₹{{product.price}}</span>
        </div>
        <button class="add-to-cart" (click)="view(product._id)">View</button>
      </div>
    </div>
  </div>
</section>

  <section class="categories-section container">
  <h2 class="section-title">Shop by Category</h2>
  <div class="categories-grid">
    <a class="category-card" *ngFor="let c of categories" [routerLink]="c.route">
      <div class="category-icon">{{c.icon}}</div>
      <p class="category-name">{{c.name}}</p>
    </a>
  </div>
</section>

<section class="trending-section container">
  <div class="section-header">
    <h2 class="section-title">Trending Deals</h2>
    <a class="view-all-btn">View All ›</a>
  </div>
  <div class="trending-grid">
    <div class="trending-card" *ngFor="let product of products.slice(4,9)">
      <img [src]="getImageSrc(product.images)" alt="{{product.name}}" class="trending-image" (error)="$event.target.src='/assets/placeholder.svg'" />
      <div class="trending-info">
        <h3>{{product.name}}</h3>
        <div class="trending-footer">
          <span class="trending-price">₹{{product.price}}</span>
          <button class="add-btn" (click)="view(product._id)">Add</button>
        </div>
      </div>
    </div>
  </div>
</section>

<footer class="footer container">
  <div class="footer-grid">
    <div>
      <h3 class="footer-brand">GroceryHub</h3>
      <p>Fresh groceries delivered to your doorstep with love and care.</p>
    </div>
    <div>
      <h4>Quick Links</h4>
      <ul>
        <li>About Us</li>
        <li>Contact</li>
        <li>Careers</li>
      </ul>
    </div>
    <div>
      <h4>Categories</h4>
      <ul>
        <li>Vegetables</li>
        <li>Fruits</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">© 2025 GroceryHub. All rights reserved.</div>
</footer>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  products: any[] = [];
  loading = true;
  currentSlideIndex = 0;
  slides: Array<any> = [
    { image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=600&fit=crop', title: 'Fresh Groceries Delivered', subtitle: 'Get the best quality products at your doorstep', buttonText: 'Shop Now' },
    { image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=600&fit=crop', title: '100% Organic Vegetables', subtitle: 'Farm fresh vegetables delivered daily', buttonText: 'Explore' },
    { image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&h=600&fit=crop', title: 'Premium Fresh Fruits', subtitle: 'Handpicked seasonal fruits', buttonText: 'Order Now' }
  ];

  categories = [
    { icon: '🥬', name: 'Vegetables', route: '/category/vegetables' },
    { icon: '🍎', name: 'Fruits', route: '/category/fruits' },
    { icon: '🥛', name: 'Dairy', route: '/category/dairy' },
    { icon: '🍞', name: 'Bakery', route: '/category/bakery' },
    { icon: '🥩', name: 'Meat', route: '/category/meat' },
    { icon: '🍿', name: 'Snacks', route: '/category/snacks' },
    { icon: '🥤', name: 'Beverages', route: '/category/beverages' },
    { icon: '🌾', name: 'Offers', route: '/category/offers' }
  ];

  slideTimer: any = null;
  countdownTimer: any = null;
  timeLeft = { hours: 23, minutes: 45, seconds: 30 };

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(q => {
      const search = q?.search || q?.q || null;
      this.fetch(search ? { search } : undefined);
    });
    this.slideTimer = setInterval(() => this.nextSlide(), 4000);
    this.countdownTimer = setInterval(() => this.tickCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  fetch(params?: any) {
    this.loading = true;
    const query = Object.assign({ limit: 20 }, params || {});
    this.productService.list(query).subscribe({
      next: (res: any) => { this.products = res.products || res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  view(id: string) { if (id) this.router.navigate([`/product/${id}`]); }

  getImageSrc(img?: string) {
    if (!img) return '/assets/placeholder.svg';
    // accept array or string
    const val = Array.isArray(img) ? img.find((x: any) => !!x) : img;
    if (!val) return '/assets/placeholder.svg';
    if (/^https?:\/\//.test(val)) return val;
    // image stored as /uploads or uploads -> prefix backend origin
    if (val.startsWith('/uploads')) return `${environment.backendBase}${val}`;
    if (val.startsWith('uploads')) return `${environment.backendBase}/${val}`;
    return val;
  }

  nextSlide() { this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length; }
  previousSlide() { this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length; }
  showSlide(i: number) { this.currentSlideIndex = i; }

  tickCountdown() {
    const totalSeconds = this.timeLeft.hours * 3600 + this.timeLeft.minutes * 60 + this.timeLeft.seconds - 1;
    if (totalSeconds <= 0) {
      this.timeLeft = { hours: 23, minutes: 59, seconds: 59 };
    } else {
      this.timeLeft = {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
      };
    }
  }
}
