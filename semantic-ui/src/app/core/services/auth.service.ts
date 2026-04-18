import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthResponse, RegisterResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;

  private _token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = computed(() => !!this._token());
  get token() { return this._token(); }

  login(creds: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, creds).pipe(
      tap(res => { this._token.set(res.token); localStorage.setItem('token', res.token); })
    );
  }

  register(creds: LoginRequest) {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/api/auth/register`, creds);
  }

  logout() {
    this._token.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  getUserEmail(): string {
    try {
      const payload = JSON.parse(atob(this._token()!.split('.')[1]));
      return payload.email || '';
    } catch { return ''; }
  }
}