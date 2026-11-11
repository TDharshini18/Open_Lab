import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/auth.service';
import { homePath } from '../core/guards';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="center-card auth-card">
      <div class="auth-header">
        <span class="auth-emoji">🧪</span>
        <h1>Welcome back</h1>
        <p>Sign in to OpenLabs</p>
      </div>

      <mat-card-content>
        <form class="stack" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" required autocomplete="username">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" name="password" [(ngModel)]="password" required autocomplete="current-password">
          </mat-form-field>

          @if (error) {
            <p class="notice-error">⚠️ {{ error }}</p>
          }

          <button mat-flat-button color="primary" type="submit" class="full-width big-btn" [disabled]="loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="switch">New here? <a routerLink="/register">Register your college or company</a></p>
      </mat-card-content>

      <mat-card-footer class="demo-box">
        <p class="muted"><strong>Try a demo account</strong> (password: password123)</p>
        <p class="muted">🏫 College contact: contact.riverside&#64;openlabs.local</p>
        <p class="muted">🏢 Company buyer: buyer&#64;nova.local</p>
        <p class="muted">🛡️ Admin: admin&#64;openlabs.local</p>
      </mat-card-footer>
    </mat-card>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: res => this.router.navigateByUrl(homePath(res.user)),
      error: err => {
        this.loading = false;
        this.error = err.error?.error ?? 'Login failed';
      },
    });
  }
}
