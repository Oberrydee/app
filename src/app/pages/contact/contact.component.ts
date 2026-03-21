import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  successMessage = '';

  readonly contactForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.maxLength(300)]]
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.successMessage = 'Demande de contact envoyée avec succès.';
    this.contactForm.reset({
      email: '',
      message: ''
    });
  }

  hasError(controlName: 'email' | 'message', errorCode: string): boolean {
    const control = this.contactForm.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }
}
