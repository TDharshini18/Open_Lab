import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginResponse, MessageResponse, User } from './models';

const TOKEN_KEY = 'openlabs_token';
const USER_KEY = 'openlabs_user';

/** Holds the signed-in user and the JWT. Everything else reads from here. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<User | null>(readStoredUser());

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.user.set(res.user);
      })
    );
  }

  register(body: unknown) {
    return this.http.post<MessageResponse>('/api/auth/register-org', body);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}
