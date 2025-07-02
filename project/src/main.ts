import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { routes } from './app/app.routes';
import { AuthService } from './app/services/auth.service';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { LoginComponent } from './app/components/login/login.component';
import { LayoutComponent } from './app/components/layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, LayoutComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <app-layout />
    } @else {
      <app-login />
    }
  `
})
export class App {
  constructor(public authService: AuthService) {}
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});