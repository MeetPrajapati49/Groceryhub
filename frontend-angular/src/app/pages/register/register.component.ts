import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

function passwordMatchValidator(control: AbstractControl) {
  const p = control.get('password');
  const c = control.get('confirmPassword');
  return p && c && p.value === c.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <h2>Register</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input class="auth-input" formControlName="name" type="text" placeholder="Name" />
        <div *ngIf="nameControl.touched && nameControl.invalid" class="error-message">Name is required</div>

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

        <input class="auth-input" formControlName="confirmPassword" type="password" placeholder="Confirm Password" />
        <div *ngIf="form.errors?.['passwordMismatch'] && (confirmPasswordControl.touched || form.touched)" class="error-message">Passwords do not match</div>

        <button class="auth-button" type="submit" [disabled]="form.invalid">Register</button>
        <div *ngIf="error" class="error-message">{{error}}</div>
      </form>
      <p style="margin-top:12px">Already have an account? <a routerLink="/login">Login here</a></p>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get nameControl() { return this.form.get('name')!; }
  get emailControl() { return this.form.get('email')!; }
  get passwordControl() { return this.form.get('password')!; }
  get confirmPasswordControl() { return this.form.get('confirmPassword')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error = null;
    const { name, email, password } = this.form.value;
    this.auth.register(name, email, password).subscribe({ next: () => this.router.navigate(['/']), error: (err) => this.error = err.error?.error || 'Register failed' });
  }
}
