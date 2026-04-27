import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'appTheme';
  private readonly themeSubject = new BehaviorSubject<AppTheme>(this.getStoredTheme());

  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  get isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    this.setTheme(this.isDarkMode ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme): void {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }

  private getStoredTheme(): AppTheme {
    const storedTheme = localStorage.getItem(this.storageKey);
    return storedTheme === 'dark' ? 'dark' : 'light';
  }
}
