import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { User } from '../../../../core/models/user.model';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  users: User[] = [];

  constructor(private readonly usersService: UsersService) {}

  get totalUsers(): number {
    return this.users.length;
  }

  get totalAdmins(): number {
    return this.users.filter((user) => user.role === 'admin').length;
  }

  roleBadgeClass(user: User): string {
    return user.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600';
  }

  verificationBadgeClass(user: User): string {
    return user.isEmailVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.usersService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.users = response.results;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudieron cargar los usuarios.';
        }
      });
  }
}
