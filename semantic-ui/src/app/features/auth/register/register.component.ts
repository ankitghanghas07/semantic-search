import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder); private auth = inject(AuthService); private router = inject(Router);

  loading = signal(false); error = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm:  ['', Validators.required]
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    const { email, password, confirm } = this.form.value;
    if (password !== confirm) { this.error.set('Passwords do not match'); return; }
    this.loading.set(true); this.error.set('');
    this.auth.register({ email: email!, password: password! }).subscribe({
      next: () => this.auth.login({ email: email!, password: password! }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.router.navigate(['/auth/login'])
      }),
      error: err => { this.error.set(err.error?.message || 'Registration failed'); this.loading.set(false); }
    });
  }
}