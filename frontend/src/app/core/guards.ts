import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from './models';

/** Which part of the app a route belongs to. */
export type Area = 'ADMIN' | 'COLLEGE' | 'COMPANY';

/** Where each kind of user lands after signing in. */
export function homePath(user: User | null): string {
  if (!user) return '/login';
  if (user.role === 'ADMIN') return '/admin';
  if (user.organizationType === 'COLLEGE') return '/college';
  if (user.organizationType === 'COMPANY') return '/browse';
  return '/login';
}

export function canAccess(user: User | null, area: Area): boolean {
  if (!user) return false;
  switch (area) {
    case 'ADMIN':
      return user.role === 'ADMIN';
    case 'COLLEGE':
      return user.role === 'ORG_CONTACT' && user.organizationType === 'COLLEGE';
    case 'COMPANY':
      return user.organizationType === 'COMPANY';
    default:
      return false;
  }
}

/** Blocks a route unless the signed-in user belongs to the given area. */
export const areaGuard = (area: Area): CanActivateFn => () => {
  const user = inject(AuthService).user();
  const router = inject(Router);
  if (!user) return router.createUrlTree(['/login']);
  return canAccess(user, area) || router.createUrlTree([homePath(user)]);
};

/** The empty root path just sends people to their own home page. */
export const homeGuard: CanActivateFn = () => {
  const user = inject(AuthService).user();
  return inject(Router).createUrlTree([homePath(user)]);
};
