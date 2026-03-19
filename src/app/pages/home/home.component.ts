import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAdmin$ = this.authenticationService.isAdmin();

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin$ = this.authenticationService.isAdmin();
  }

  logout(): void {
    this.authenticationService.logout();
    void this.router.navigate(['/login']);
  }
}
