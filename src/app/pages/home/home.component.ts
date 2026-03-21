import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentUser } from 'src/app/models/auth.models';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser$: Observable<CurrentUser | null> = this.authenticationService.currentUser$;

  constructor(private readonly authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authenticationService.currentUser$;
  }
}
