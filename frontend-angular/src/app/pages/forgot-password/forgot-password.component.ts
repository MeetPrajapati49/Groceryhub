import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-forgot-password',
    template: `
    <div class="auth-container">
      <h2>Reset Password</h2>

      <!-- Step 1: Enter Email -->
      <form *ngIf="step === 1" [formGroup]="emailForm" (ngSubmit)="requestCode()">
        <p class="subtitle">Enter your email to receive a reset code</p>
        <input class="auth-input" formControlName="email" type="email" placeholder="Email" />
        <div *ngIf="emailForm.get('email')?.touched && emailForm.get('email')?.invalid" class="error-message">
          <div *ngIf="emailForm.get('email')?.errors?.['required']">Email is required</div>
          <div *ngIf="emailForm.get('email')?.errors?.['email']">Enter a valid email</div>
        </div>
        <button class="auth-button" type="submit" [disabled]="emailForm.invalid || loading">
          {{ loading ? 'Sending...' : 'Send Reset Code' }}
        </button>
        <div *ngIf="error" class="error-message">{{error}}</div>
      </form>

      <!-- Step 2: Enter Code + New Password -->
      <form *ngIf="step === 2" [formGroup]="resetForm" (ngSubmit)="resetPassword()">
        <div class="demo-notice">
          <span class="demo-icon">🔑</span>
          <span>Demo Mode: Your reset code is <strong>{{demoCode}}</strong></span>
        </div>
        <input class="auth-input" formControlName="code" type="text" placeholder="6-digit code" maxlength="6" />
        <div *ngIf="resetForm.get('code')?.touched && resetForm.get('code')?.invalid" class="error-message">
          <div *ngIf="resetForm.get('code')?.errors?.['required']">Code is required</div>
          <div *ngIf="resetForm.get('code')?.errors?.['minlength']">Code must be 6 digits</div>
        </div>
        <input class="auth-input" formControlName="newPassword" type="password" placeholder="New password" />
        <div *ngIf="resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid" class="error-message">
          <div *ngIf="resetForm.get('newPassword')?.errors?.['required']">Password is required</div>
          <div *ngIf="resetForm.get('newPassword')?.errors?.['minlength']">Password must be at least 6 characters</div>
        </div>
        <input class="auth-input" formControlName="confirmPassword" type="password" placeholder="Confirm password" />
        <div *ngIf="resetForm.get('confirmPassword')?.touched && passwordMismatch" class="error-message">
          Passwords do not match
        </div>
        <button class="auth-button" type="submit" [disabled]="resetForm.invalid || passwordMismatch || loading">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
        <div *ngIf="error" class="error-message">{{error}}</div>
      </form>

      <!-- Step 3: Success -->
      <div *ngIf="step === 3" class="success-state">
        <div class="success-icon">✅</div>
        <h3>Password Reset Successful!</h3>
        <p>You can now login with your new password.</p>
        <a routerLink="/login" class="auth-button" style="display:inline-block;text-align:center;text-decoration:none">Go to Login</a>
      </div>

      <p *ngIf="step !== 3" style="margin-top:12px">
        Remember your password? <a routerLink="/login">Back to Login</a>
      </p>
    </div>
  `,
    styles: [`
    .subtitle { color: #888; margin: 0 0 20px; font-size: 14px; }
    .demo-notice {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      border: 1px solid #81c784;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .demo-icon { font-size: 20px; }
    .demo-notice strong { color: #2e7d32; font-size: 18px; letter-spacing: 2px; }
    .success-state { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 56px; margin-bottom: 12px; }
    .success-state h3 { margin: 0 0 8px; color: #2e7d32; }
    .success-state p { color: #888; margin: 0 0 24px; }
  `]
})
export class ForgotPasswordComponent {
    step = 1;
    loading = false;
    error: string | null = null;
    demoCode = '';
    private email = '';

    emailForm: FormGroup;
    resetForm: FormGroup;

    constructor(
        private api: ApiService,
        private router: Router,
        private toast: ToastService,
        private fb: FormBuilder
    ) {
        this.emailForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
        this.resetForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(6)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        });
    }

    get passwordMismatch(): boolean {
        return this.resetForm.get('newPassword')?.value !== this.resetForm.get('confirmPassword')?.value;
    }

    requestCode() {
        if (this.emailForm.invalid) return;
        this.loading = true;
        this.error = null;
        this.email = this.emailForm.value.email;

        this.api.post<{ message: string; code: string }>('/auth/forgot-password', { email: this.email }).subscribe({
            next: (res) => {
                this.demoCode = res.code;
                this.step = 2;
                this.loading = false;
                this.toast.show('Reset code generated!', 'success');
            },
            error: (err) => {
                this.error = err.error?.error || 'Failed to send reset code';
                this.loading = false;
            }
        });
    }

    resetPassword() {
        if (this.resetForm.invalid || this.passwordMismatch) return;
        this.loading = true;
        this.error = null;
        const { code, newPassword } = this.resetForm.value;

        this.api.post<{ message: string }>('/auth/reset-password', {
            email: this.email,
            code,
            newPassword
        }).subscribe({
            next: () => {
                this.step = 3;
                this.loading = false;
                this.toast.show('Password reset successful!', 'success');
            },
            error: (err) => {
                this.error = err.error?.error || 'Failed to reset password';
                this.loading = false;
            }
        });
    }
}
