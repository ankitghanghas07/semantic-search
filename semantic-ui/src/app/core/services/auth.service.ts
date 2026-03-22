import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'token';

  constructor(private api: ApiService) {}

  login(data: LoginRequest) {
    return this.api.post<LoginResponse>('/auth/login', data);
  }

  register(data: LoginRequest) {
    return this.api.post('/auth/register', data);
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}