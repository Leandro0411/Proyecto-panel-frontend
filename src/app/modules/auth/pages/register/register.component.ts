import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  isSubmitting = false;

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [passwordMatchValidator()]
    }
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => void this.router.navigate(['/users']),
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo completar el registro.', 'Cerrar', {
            duration: 4000
          });
        }
      });
  }

  hasError(controlName: 'name' | 'email' | 'password' | 'confirmPassword', errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control?.touched && !!control.errors?.[errorName];
  }

  get passwordsDoNotMatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') && this.registerForm.touched;
  }
}
