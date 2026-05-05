import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
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
  readonly cartItems$ = this.cartService.cartItems$;

  constructor(
    private readonly authService: AuthService,
    private readonly themeService: ThemeService,
    private readonly cartService: CartService
  ) {}

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
