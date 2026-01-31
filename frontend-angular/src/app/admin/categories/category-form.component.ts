import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-category-form',
  template: `
    <div class="auth-container">
      <h2>New Category</h2>
      <form (ngSubmit)="submit()">
        <input class="auth-input" [(ngModel)]="name" name="name" placeholder="Category name" required />
        <button class="auth-button" type="submit">Create</button>
      </form>
    </div>
  `
})
export class AdminCategoryFormComponent {
  name = '';
  saving = false;
  constructor(private admin: AdminService, private router: Router) {}

  slugify(v: string) {
    return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  submit() {
    const name = (this.name || '').trim();
    if (!name) return alert('Category name is required');
    const payload = { name, slug: this.slugify(name) };
    this.saving = true;
    this.admin.createCategory(payload).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/admin/categories']); },
      error: (err) => { this.saving = false; alert(err?.error?.message || 'Failed to create category'); }
    });
  }
}
