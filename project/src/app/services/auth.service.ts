import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { User, LoginRequest, LoginResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  // Mock data pour la démo
  private mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@stockmanager.com',
      firstName: 'Admin',
      lastName: 'System',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      username: 'manager',
      email: 'manager@stockmanager.com',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      username: 'employee',
      email: 'employee@stockmanager.com',
      firstName: 'Jean',
      lastName: 'Martin',
      role: UserRole.EMPLOYEE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Simulation d'appel API - remplacer par un vrai appel HTTP
    const user = this.mockUsers.find(u => 
      u.username === credentials.username && credentials.password === 'password'
    );

    if (!user) {
      throw new Error('Identifiants invalides');
    }

    const response: LoginResponse = {
      token: this.generateMockToken(),
      user,
      expiresIn: 3600
    };

    return of(response).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      })
    );

    // Vrai appel API (à décommenter quand le backend sera prêt)
    // return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
    //   .pipe(
    //     tap(response => {
    //       this.setAuthData(response.token, response.user);
    //     })
    //   );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  private generateMockToken(): string {
    return `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}