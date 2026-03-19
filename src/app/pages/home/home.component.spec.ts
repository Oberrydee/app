import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let router: Router;

  beforeEach(() => {
    authenticationService = jasmine.createSpyObj<AuthenticationService>(
      'AuthenticationService',
      ['logout']
    );

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [HomeComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationService
        }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logs out and redirects to login', () => {
    component.logout();

    expect(authenticationService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
