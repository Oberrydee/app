import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, filter } from 'rxjs';
import { CurrentUser } from './models/auth.models';
import { AuthenticationService } from './modules/authentication-module/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly currentUser$: Observable<CurrentUser | null> = this.authenticationService.currentUser$;
  readonly isAdmin$ = this.authenticationService.isAdmin();
  private currentUrl = this.router.url;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  get showSidebar(): boolean {
    return this.authenticationService.isAuthenticated() && !this.currentUrl.startsWith('/login');
  }

  logout(): void {
    this.authenticationService.logout();
    void this.router.navigate(['/login']);
  }
}
