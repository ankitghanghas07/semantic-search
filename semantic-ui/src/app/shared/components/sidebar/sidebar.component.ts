import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private auth  = inject(AuthService);
  collapsed     = signal(false);
  toggle()      { this.collapsed.update(v => !v); }
  logout()      { this.auth.logout(); }
  get email()   { return this.auth.getUserEmail(); }
  get initial() { return this.email.charAt(0).toUpperCase(); }
}