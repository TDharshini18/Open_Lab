import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './core/auth.service';
import { canAccess } from './core/guards';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatIconModule, MatToolbarModule],
  template: `
    <mat-toolbar class="toolbar">
      <a routerLink="/" class="brand">
        <span class="logo">🧪</span>
        <span>OpenLabs</span>
      </a>

      @if (auth.isLoggedIn()) {
        <nav class="nav">
          @if (isCompany()) {
            <a mat-button routerLink="/browse" routerLinkActive="active">Browse</a>
            <a mat-button routerLink="/my-requests" routerLinkActive="active">My requests</a>
          }
          @if (isCollege()) {
            <a mat-button routerLink="/college" routerLinkActive="active">My college</a>
          }
          @if (isAdmin()) {
            <a mat-button routerLink="/admin" routerLinkActive="active">Admin</a>
          }
        </nav>

        <span class="spacer"></span>

        <div class="user">
          <span class="initial">{{ initial() }}</span>
          <span>
            {{ auth.user()?.name }}
            @if (auth.user()?.organizationName) {
              <small class="org">{{ auth.user()?.organizationName }}</small>
            }
          </span>
        </div>
        <button mat-icon-button (click)="auth.logout()" aria-label="Log out" title="Log out">
          <mat-icon>logout</mat-icon>
        </button>
      } @else {
        <span class="spacer"></span>
        <a mat-button routerLink="/login">Log in</a>
        <a mat-flat-button routerLink="/register" class="cta">Join OpenLabs</a>
      }
    </mat-toolbar>

    <main class="page">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);

  isAdmin(): boolean {
    return canAccess(this.auth.user(), 'ADMIN');
  }

  isCollege(): boolean {
    return canAccess(this.auth.user(), 'COLLEGE');
  }

  isCompany(): boolean {
    return canAccess(this.auth.user(), 'COMPANY');
  }

  initial(): string {
    return (this.auth.user()?.name ?? '?').charAt(0).toUpperCase();
  }
}
