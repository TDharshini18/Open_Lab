import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatProgressSpinnerModule, MatSelectModule],
  template: `
    <mat-card class="center-card auth-card">
      <div class="auth-header">
        <span class="auth-emoji">🚀</span>
        <h1>Join OpenLabs</h1>
        <p>Register your college or company</p>
      </div>

      @if (submitted) {
        <mat-card-content class="success">
          <span class="success-emoji">🎉</span>
          <h2>You're in the queue!</h2>
          <p>{{ message }}</p>
          <a mat-flat-button color="primary" routerLink="/login">Back to sign in</a>
        </mat-card-content>
      } @else {
        <mat-card-content>
          <form class="stack" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Organization type</mat-label>
              <mat-select name="orgType" [(ngModel)]="orgType" required>
                <mat-option value="COLLEGE">🏫 College or institute</mat-option>
                <mat-option value="COMPANY">🏢 Company</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Organization name</mat-label>
              <input matInput name="orgName" [(ngModel)]="orgName" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Your name (point of contact)</mat-label>
              <input matInput name="contactName" [(ngModel)]="contactName" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Work email</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required autocomplete="username">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password (min 8 characters)</mat-label>
              <input matInput type="password" name="password" [(ngModel)]="password" minlength="8" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm password</mat-label>
              <input matInput type="password" name="confirm" [(ngModel)]="confirm" required>
            </mat-form-field>

            @if (error) {
              <p class="notice-error">⚠️ {{ error }}</p>
            }

            <button mat-flat-button color="primary" type="submit" class="full-width big-btn" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Send registration
              }
            </button>
          </form>

          <p class="switch">Already registered? <a routerLink="/login">Sign in</a></p>
        </mat-card-content>
      }
    </mat-card>
  `,
  styles: [`
    .success { text-align: center; padding: 16px 24px 28px; }
    .success h2 { margin: 8px 0; }
    .success-emoji { font-size: 56px; display: block; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);

  orgType: 'COLLEGE' | 'COMPANY' = 'COLLEGE';
  orgName = '';
  contactName = '';
  email = '';
  password = '';
  confirm = '';
  error = '';
  loading = false;
  submitted = false;
  message = '';

  submit(): void {
    this.error = '';
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.auth.register({
      orgName: this.orgName,
      orgType: this.orgType,
      contactName: this.contactName,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: res => {
        this.loading = false;
        this.submitted = true;
        this.message = res.message;
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.error ?? 'Registration failed';
      },
    });
  }
}
