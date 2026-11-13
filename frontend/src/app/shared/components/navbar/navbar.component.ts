import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import {MatDividerModule} from "@angular/material/divider";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule,MatDividerModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/dashboard" class="brand">
        <mat-icon>folder_special</mat-icon>
        <span>Digital Solutions</span>
      </a>

      <nav class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link">
          <mat-icon>dashboard</mat-icon> Tableau de bord
        </a>
        <a mat-button routerLink="/projects" routerLinkActive="active-link">
          <mat-icon>work</mat-icon> Projets
        </a>
        <a mat-button routerLink="/my-tasks" routerLinkActive="active-link">
          <mat-icon>assignment</mat-icon> Mes tâches
        </a>
      </nav>

      <span class="spacer"></span>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <div class="avatar">{{ initials }}</div>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="menu-header">
          <strong>{{ user?.nom }} {{ user?.prenom }}</strong>
          <small>{{ user?.email }}</small>
          <span class="role-badge">{{ user?.role }}</span>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item routerLink="/profile">
          <mat-icon>person</mat-icon> Mon profil
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon> Déconnexion
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none;
      color: white; font-size: 1.2rem; font-weight: 600; }
    .nav-links { display: flex; gap: 4px; margin-left: 24px; }
    .nav-links a { display: flex; align-items: center; gap: 4px; font-size: 0.9rem; }
    .active-link { background: rgba(255,255,255,0.15) !important; border-radius: 4px; }
    .spacer { flex: 1; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      font-size: 0.85rem; color: white; cursor: pointer; }
    .menu-header { padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; }
    .menu-header strong { font-size: 0.95rem; }
    .menu-header small { color: #666; font-size: 0.8rem; }
    .role-badge { font-size: 0.7rem; background: #e3f2fd; color: #1565c0;
      padding: 2px 8px; border-radius: 12px; width: fit-content; margin-top: 4px; }
    @media (max-width: 768px) {
      .nav-links span { display: none; }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  get user() { return this.authService.currentUser(); }
  get initials() {
    const u = this.user;
    if (!u) return '?';
    return ((u.prenom?.[0] || '') + (u.nom?.[0] || '')).toUpperCase() || '?';
  }

  logout() { this.authService.logout(); }
}
