import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  readonly user$: Observable<User | null> = this.authService.currentUser$;
  readonly theme$ = this.themeService.theme$;

  constructor(
    private readonly authService: AuthService,
    private readonly themeService: ThemeService
  ) {}

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
