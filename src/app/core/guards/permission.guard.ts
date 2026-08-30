import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const hasPermission = (permission: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession().pipe(
    map((loggedIn) => {
      if (!loggedIn) {
        return router.createUrlTree(['/auth/login']);
      }
      return auth.can(permission) ? true : router.createUrlTree(['/forbidden']);
    }),
  );
};