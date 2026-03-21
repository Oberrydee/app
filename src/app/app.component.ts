import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, filter, finalize } from 'rxjs';
import { CurrentUser } from './models/auth.models';
import { AdminContactResponse } from './models/contact.models';
import { AuthenticationService } from './modules/authentication-module/authentication/authentication.service';
import { ContactService } from './modules/components/contact/contact.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly currentUser$: Observable<CurrentUser | null> = this.authenticationService.currentUser$;
  readonly isAdmin$ = this.authenticationService.isAdmin();
  readonly adminContactForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  private currentUrl = this.router.url;
  adminSupportVisible = false;
  adminSupportLoading = false;
  adminSupportSaving = false;
  adminSupportError = '';
  adminSupportSuccess = '';
  adminContactEmail = '';
  adminSupportDismissed = false;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly contactService: ContactService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router, 
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects;

      if (this.authenticationService.getCurrentUserValue()?.email === 'admin@admin.com') {
        this.adminSupportVisible = !this.currentUrl.startsWith('/login') && !this.adminSupportDismissed;
      }
    });

    this.authenticationService.currentUser$.subscribe((user) => {
      if (user?.email === 'admin@admin.com') {
        this.loadAdminContact();
        return;
      }

      this.resetAdminDialog();
    });
  }

  get showSidebar(): boolean {
    return this.authenticationService.isAuthenticated() && !this.currentUrl.startsWith('/login');
  }

  get canDismissAdminSupport(): boolean {
    return !!this.adminContactEmail;
  }

  get showAdminSupportLauncher(): boolean {
    return this.showSidebar
      && this.authenticationService.getCurrentUserValue()?.email === 'admin@admin.com'
      && this.canDismissAdminSupport
      && !this.adminSupportVisible;
  }

  logout(): void {
    this.authenticationService.logout();
    void this.router.navigate(['/login']);
  }

  openAdminSupport(): void {
    this.adminSupportDismissed = false;
    this.adminSupportVisible = true;
    this.adminSupportError = '';
    this.adminSupportSuccess = '';
  }

  onAdminSupportVisibleChange(visible: boolean): void {
    if (!visible && this.canDismissAdminSupport) {
      this.adminSupportDismissed = true;
      this.adminSupportVisible = false;
      return;
    }

    this.adminSupportVisible = visible;
  }

  saveAdminContact(): void {
    if (this.adminContactForm.invalid) {
      this.adminContactForm.markAllAsTouched();
      return;
    }

    this.adminSupportSaving = true;
    this.adminSupportError = '';
    this.adminSupportSuccess = '';

    this.contactService.updateAdminContact(this.adminContactForm.getRawValue()).pipe(
      finalize(() => {
        this.adminSupportSaving = false;
      })
    ).subscribe({
      next: (adminContact) => {
        this.applyAdminContact(adminContact);
        this.adminSupportSuccess = 'Email de support mis a jour.';
        this.adminSupportDismissed = false;
        this.adminSupportVisible = true;
      },
      error: (error: HttpErrorResponse) => {
        this.adminSupportError = error.error?.message || 'Impossible de mettre a jour l\'email de support.';
      }
    });
  }

  hasAdminContactError(errorCode: string): boolean {
    const control = this.adminContactForm.controls.email;
    return control.touched && control.hasError(errorCode);
  }

  private loadAdminContact(): void {
    this.adminSupportVisible = this.showSidebar && !this.adminSupportDismissed;
    this.adminSupportLoading = true;
    this.adminSupportError = '';
    this.adminSupportSuccess = '';

    this.contactService.getAdminContact().pipe(
      finalize(() => {
        this.adminSupportLoading = false;
      })
    ).subscribe({
      next: (adminContact) => {
        this.applyAdminContact(adminContact);
        this.adminSupportVisible = !this.currentUrl.startsWith('/login') && !this.adminSupportDismissed;
      },
      error: (error: HttpErrorResponse) => {
        this.adminSupportVisible = !this.currentUrl.startsWith('/login') && !this.adminSupportDismissed;
        this.adminSupportError = error.error?.message || 'Impossible de charger les informations de contact de support.';
      }
    });
  }

  private applyAdminContact(adminContact: AdminContactResponse): void {
    this.adminContactEmail = adminContact.email.trim();
    this.adminSupportDismissed = false;
    this.adminContactForm.patchValue({
      email: this.adminContactEmail
    });
    this.adminContactForm.markAsPristine();
  }

  private resetAdminDialog(): void {
    this.adminSupportVisible = false;
    this.adminSupportLoading = false;
    this.adminSupportSaving = false;
    this.adminSupportError = '';
    this.adminSupportSuccess = '';
    this.adminContactEmail = '';
    this.adminSupportDismissed = false;
    this.adminContactForm.reset({
      email: ''
    });
  }

}
