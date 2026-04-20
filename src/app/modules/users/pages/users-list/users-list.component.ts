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
