import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUserPayload, UpdateUserPayload } from '../../../../core/models/user-admin.model';
import { User } from '../../../../core/models/user.model';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

export interface UserFormDialogResult {
  mode: 'create' | 'edit';
  payload: CreateUserPayload | UpdateUserPayload;
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss']
})
export class UserFormDialogComponent {
  readonly isEditMode = this.data.mode === 'edit';

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.user?.name ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    role: [this.data.user?.role ?? 'user' as 'admin' | 'user', [Validators.required]],
    password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UserFormDialogData
  ) {
    if (this.isEditMode) {
      this.form.controls.role.disable();
      this.form.controls.password.addValidators([Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  get title(): string {
    return this.isEditMode ? 'Editar usuario' : 'Crear usuario';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Guardar cambios' : 'Crear usuario';
  }

  hasError(controlName: 'name' | 'email' | 'role' | 'password', errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.touched && !!control.errors?.[errorName];
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();

    if (this.isEditMode) {
      const payload: UpdateUserPayload = {
        name: rawValue.name,
        email: rawValue.email,
        ...(rawValue.password ? { password: rawValue.password } : {})
      };

      this.dialogRef.close({
        mode: 'edit',
        payload
      } as UserFormDialogResult);
      return;
    }

    this.dialogRef.close({
      mode: 'create',
      payload: {
        name: rawValue.name,
        email: rawValue.email,
        password: rawValue.password,
        role: rawValue.role
      }
    } as UserFormDialogResult);
  }
}
