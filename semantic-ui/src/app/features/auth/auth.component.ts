import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin = true;

  email = '';
  password = '';

  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  async submit() {
    this.loading = true;
    this.error = '';

    try {
      if (this.isLogin) {
        const res = await firstValueFrom(
          this.auth.login({
            email: this.email,
            password: this.password,
          })
        );

        this.auth.setToken(res.token);

        // navigate only after successful login
        this.router.navigate(['/dashboard']);

      } else {
        await firstValueFrom(
          this.auth.register({
            email: this.email,
            password: this.password,
          })
        );

        // switch to login mode after registration
        this.isLogin = true;
        this.error = 'Registration successful. Please login.';
      }

    } catch (err: any) {
      this.error = err?.error?.message || 'Something went wrong';
    } finally {
      this.loading = false;
    }
  }
}