import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authenticationService.ensureSession().pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }

        return this.router.createUrlTree(['/login'], {
          queryParams: {
            returnUrl: state.url
          }
        });
      })
    );
  }
}
