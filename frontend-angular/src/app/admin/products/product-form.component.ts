import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-product-form',
  template: `
    <div class="auth-container">
      <h2>{{isEdit ? 'Edit' : 'New'}} Product</h2>
      <form (ngSubmit)="submit()">
        <input class="auth-input" [(ngModel)]="product.name" name="name" placeholder="Name" required />
        <input class="auth-input" [(ngModel)]="product.price" name="price" type="number" placeholder="Price" required />
        <input class="auth-input" [(ngModel)]="product.category" name="category" placeholder="Category" required />
        <textarea class="auth-input" [(ngModel)]="product.description" name="description" placeholder="Description"></textarea>

        <div style="margin:12px 0">
          <label>Existing Images</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <div *ngFor="let img of product.images || []; let i = index" style="position:relative">
              <img [src]="getImageSrc(img)" style="width:96px;height:96px;object-fit:cover;border:1px solid #ddd" />
              <button type="button" (click)="removeImage(i)" style="position:absolute;right:2px;top:2px;background:#fff;border:1px solid #ccc;border-radius:4px;padding:2px">x</button>
            </div>
          </div>
        </div>

        <div style="margin:12px 0">
          <label>Upload New Images</label>
          <input type="file" (change)="onFilesSelected($event)" multiple accept="image/*" />
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <div *ngFor="let p of previews; let idx = index" style="position:relative">
              <img [src]="p" style="width:96px;height:96px;object-fit:cover;border:1px solid #ddd" />
              <button type="button" (click)="removePreview(idx)" style="position:absolute;right:2px;top:2px;background:#fff;border:1px solid #ccc;border-radius:4px;padding:2px">x</button>
            </div>
          </div>
          <div style="margin-top:8px">
            <button class="auth-button" type="button" (click)="uploadSelected()" [disabled]="!selectedFiles.length">Upload Selected</button>
          </div>
        </div>

        <button class="auth-button" type="submit">Save</button>
      </form>
    </div>
  `
})
export class AdminProductFormComponent implements OnInit {
  product: any = { name: '', price: 0, category: '', description: '', images: [] };
  isEdit = false;
  id: string | null = null;
  selectedFiles: File[] = [];
  previews: string[] = [];
  constructor(private admin: AdminService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit = true;
      this.admin.getProduct(this.id).subscribe({ next: (res: any) => { if (res) this.product = res; }, error: () => { alert('Failed to load product'); } });
    }
  }
  submit() {
    // ensure images array exists
    if (!this.product.images) this.product.images = [];
    if (this.isEdit && this.id) {
      this.admin.updateProduct(this.id, this.product).subscribe({ next: () => this.router.navigate(['/admin/products']), error: () => alert('Update failed') });
    } else {
      this.admin.createProduct(this.product).subscribe({ next: () => this.router.navigate(['/admin/products']), error: () => alert('Create failed') });
    }
  }

  onFilesSelected(e: any) {
    const files: FileList = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.selectedFiles.push(f);
      const url = URL.createObjectURL(f);
      this.previews.push(url);
    }
  }

  removePreview(index: number) {
    if (index < 0 || index >= this.previews.length) return;
    URL.revokeObjectURL(this.previews[index]);
    this.previews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  removeImage(index: number) {
    if (!this.product.images) return;
    this.product.images.splice(index, 1);
  }

  uploadSelected() {
    if (!this.selectedFiles.length) return;
    const fd = new FormData();
    this.selectedFiles.forEach(f => fd.append('images', f));
    this.admin.uploadImages(fd).subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.images)) {
          // backend returns images with { path, url }
          const paths = res.images.map((i: any) => i.path || i.url).filter(Boolean);
          this.product.images = (this.product.images || []).concat(paths);
          // clear selected previews
          this.previews.forEach(p => URL.revokeObjectURL(p));
          this.previews = [];
          this.selectedFiles = [];
          alert('Images uploaded');
        } else {
          alert('Upload did not return image list');
        }
      },
      error: () => alert('Image upload failed')
    });
  }
}
