import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentUser } from 'src/app/models/auth.models';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAdmin$ = this.authenticationService.isAdmin();
  currentUser$: Observable<CurrentUser | null> = this.authenticationService.currentUser$;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin$ = this.authenticationService.isAdmin();
    this.currentUser$ = this.authenticationService.currentUser$;
  }

  logout(): void {
    this.authenticationService.logout();
    void this.router.navigate(['/login']);
  }
}
