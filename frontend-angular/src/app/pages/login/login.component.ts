import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input class="auth-input" formControlName="email" type="email" placeholder="Email" />
        <div *ngIf="emailControl.touched && emailControl.invalid" class="error-message">
          <div *ngIf="emailControl.errors?.['required']">Email is required</div>
          <div *ngIf="emailControl.errors?.['email']">Enter a valid email</div>
        </div>

        <input class="auth-input" formControlName="password" type="password" placeholder="Password" />
        <div *ngIf="passwordControl.touched && passwordControl.invalid" class="error-message">
          <div *ngIf="passwordControl.errors?.['required']">Password is required</div>
          <div *ngIf="passwordControl.errors?.['minlength']">Password must be at least 6 characters</div>
        </div>

        <button class="auth-button" type="submit" [disabled]="form.invalid">Login</button>
        <div *ngIf="error" class="error-message">{{error}}</div>
      </form>
      <p style="margin-top:8px"><a routerLink="/forgot-password" style="color:#00A9A5;font-size:14px">Forgot Password?</a></p>
      <p style="margin-top:12px">Don't have an account? <a routerLink="/signup">Register here</a></p>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailControl() { return this.form.get('email')!; }
  get passwordControl() { return this.form.get('password')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error = null;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({ next: () => this.router.navigate(['/']), error: (err) => this.error = err.error?.error || 'Login failed' });
  }
}
