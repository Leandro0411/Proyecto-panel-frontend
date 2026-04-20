import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { finalize } from 'rxjs';

import { UserFormDialogComponent, UserFormDialogResult } from '../../components/user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginatedResponse } from '../../../../core/models/api-response.model';
import { CreateUserPayload, UpdateUserPayload, UserQueryParams } from '../../../../core/models/user-admin.model';
import { User } from '../../../../core/models/user.model';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  readonly displayedColumns = ['name', 'email', 'role', 'verification', 'actions'];
  readonly roleOptions: Array<{ value: '' | 'admin' | 'user'; label: string }> = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  isInitialLoading = true;
  isTableLoading = false;
  errorMessage = '';
  users: User[] = [];
  totalResults = 0;
  pageSize = 10;
  pageIndex = 0;
  nameFilter = '';
  roleFilter: '' | 'admin' | 'user' = '';
  sortActive = 'name';
  sortDirection: SortDirection = 'asc';

  constructor(
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  get totalAdmins(): number {
    return this.users.filter((user) => user.role === 'admin').length;
  }

  ngOnInit(): void {
    this.loadUsers(true);
  }

  onNameFilterChange(value: string): void {
    this.nameFilter = value.trim();
    this.pageIndex = 0;
    this.loadUsers();
  }

  onRoleFilterChange(value: '' | 'admin' | 'user'): void {
    this.roleFilter = value;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.sortActive = sort.active || 'name';
    this.sortDirection = sort.direction || 'asc';
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open<UserFormDialogComponent, unknown, UserFormDialogResult>(UserFormDialogComponent, {
      width: '560px',
      data: {
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.mode !== 'create') {
        return;
      }

      this.usersService.createUser(result.payload as CreateUserPayload).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado correctamente.', 'Cerrar', { duration: 3500 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo crear el usuario.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open<UserFormDialogComponent, unknown, UserFormDialogResult>(UserFormDialogComponent, {
      width: '560px',
      data: {
        mode: 'edit',
        user
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.mode !== 'edit') {
        return;
      }

      this.usersService.updateUser(user.id, result.payload as UpdateUserPayload).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado correctamente.', 'Cerrar', { duration: 3500 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo actualizar el usuario.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro que deseás eliminar a ${user.name}?`,
        confirmText: 'Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado correctamente.', 'Cerrar', { duration: 3500 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo eliminar el usuario.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  roleChipClass(user: User): string {
    return user.role === 'admin' ? 'chip-admin' : 'chip-user';
  }

  verificationChipClass(user: User): string {
    return user.isEmailVerified ? 'chip-verified' : 'chip-pending';
  }

  private loadUsers(showInitialLoader = false): void {
    this.errorMessage = '';
    this.isInitialLoading = showInitialLoader;
    this.isTableLoading = !showInitialLoader;

    this.usersService
      .getUsers(this.buildQuery())
      .pipe(
        finalize(() => {
          this.isInitialLoading = false;
          this.isTableLoading = false;
        })
      )
      .subscribe({
        next: (response: PaginatedResponse<User>) => {
          this.users = response.results;
          this.totalResults = response.totalResults;
          this.pageIndex = response.page - 1;
          this.pageSize = response.limit;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudieron cargar los usuarios.';
        }
      });
  }

  private buildQuery(): UserQueryParams {
    return {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      name: this.nameFilter || undefined,
      role: this.roleFilter || undefined,
      sortBy: `${this.sortActive}:${this.sortDirection || 'asc'}`
    };
  }
}
