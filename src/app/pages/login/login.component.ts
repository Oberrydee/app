import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthMode, RegisterRequest } from 'src/app/models/auth.models';
import { AuthenticationService } from 'src/app/modules/authentication-module/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  mode: AuthMode = 'login';
  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authenticationService.ensureSession().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.navigateAfterAuth();
      }
    });
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (this.mode === 'login') {
      this.submitLogin();
      return;
    }

    this.submitRegister();
  }

  hasError(formName: AuthMode, controlName: string, errorCode: string): boolean {
    const form = formName === 'login' ? this.loginForm : this.registerForm;
    const control = form.controls[controlName as keyof typeof form.controls];

    return !!control && control.touched && control.hasError(errorCode);
  }

  private submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authenticationService.login(this.loginForm.getRawValue()).pipe(
      switchMap((response) => {
        this.authenticationService.setToken(response.token);
        return this.authenticationService.ensureSession();
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.navigateAfterAuth();
          return;
        }

        this.errorMessage = "La session n'a pas pu etre initialisee.";
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: RegisterRequest = this.registerForm.getRawValue();

    this.authenticationService.register(payload).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        this.authenticationService.logout();
        this.mode = 'login';
        this.successMessage = 'Compte cree. Connectez-vous pour continuer.';
        this.loginForm.patchValue({
          email: payload.email,
          password: ''
        });
        this.registerForm.reset({
          email: payload.email,
          password: '',
          firstName: '',
          lastName: ''
        });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
    const target = returnUrl === '/login' ? '/home' : returnUrl;
    void this.router.navigateByUrl(target);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const errorPayload = error.error as
      | { title?: string; errors?: Record<string, string[] | string> }
      | undefined;

    if (typeof errorPayload?.title === 'string' && errorPayload.title.trim()) {
      return errorPayload.title;
    }

    const validationErrors = errorPayload?.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }

      if (typeof firstError === 'string' && firstError.trim()) {
        return firstError;
      }
    }

    return 'Une erreur est survenue. Reessayez.';
  }
}
