
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthResponse, RegisterResponse } from '../models/auth.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = computed(() => !!this._token());
  get token() { return this._token(); }

  login(creds: LoginRequest) {
    return this.api.post<AuthResponse>('/auth/login', creds).pipe(
      tap(res => { this._token.set(res.token); localStorage.setItem('token', res.token); })
    );
  }

  register(creds: LoginRequest) {
    return this.api.post<RegisterResponse>('/auth/register', creds);
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