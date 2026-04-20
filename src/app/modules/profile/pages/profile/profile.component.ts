import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { UsersService } from '../../../../core/services/users.service';
import { passwordMatchValidator } from '../../../auth/validators/password-match.validator';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  currentUser: User | null = null;

  readonly profileForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      confirmPassword: ['']
    },
    {
      validators: [passwordMatchValidator()]
    }
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  get passwordsDoNotMatch(): boolean {
    return this.profileForm.hasError('passwordMismatch') && this.profileForm.touched;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  hasError(controlName: 'name' | 'email' | 'password' | 'confirmPassword', errorName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control?.touched && !!control.errors?.[errorName];
  }

  submit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.profileForm.getRawValue();

    this.isSaving = true;

    this.usersService
      .updateUser(this.currentUser.id, {
        name,
        email,
        ...(password ? { password } : {})
      })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.authService.updateCurrentUser(updatedUser);
          this.profileForm.patchValue({
            name: updatedUser.name,
            email: updatedUser.email,
            password: '',
            confirmPassword: ''
          });
          this.profileForm.markAsPristine();
          this.snackBar.open('Perfil actualizado correctamente.', 'Cerrar', { duration: 3500 });
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo actualizar el perfil.', 'Cerrar', { duration: 4000 });
        }
      });
  }

  private loadProfile(): void {
    const sessionUser = this.authService.currentUser;

    if (!sessionUser) {
      this.isLoading = false;
      return;
    }

    this.usersService
      .getUserById(sessionUser.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.authService.updateCurrentUser(user);
          this.profileForm.patchValue({
            name: user.name,
            email: user.email
          });
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo cargar el perfil.', 'Cerrar', { duration: 4000 });
        }
      });
  }
}
