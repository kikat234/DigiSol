import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="logo">
            <mat-icon>folder_special</mat-icon>
            <h1>Digital Solutions</h1>
          </div>
          <p class="subtitle">Connectez-vous à votre espace</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="vous@exemple.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Mot de passe requis</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
              class="submit-btn" [disabled]="loading || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Se connecter</span>
            </button>
          </form>

          <div class="test-accounts">
            <p><strong>Comptes de test :</strong></p>
            <button mat-stroked-button (click)="fillAdmin()">Admin</button>
          </div>
        </mat-card-content>

        <mat-card-footer>
          <p>Pas encore de compte ? <a routerLink="/auth/register">S'inscrire</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
      padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; padding: 24px; border-radius: 12px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .logo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #1565c0; }
    .logo h1 { font-size: 1.5rem; margin: 0; color: #1565c0; }
    .subtitle { color: #666; margin: 0 0 24px; font-size: 0.95rem; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px; }
    .test-accounts { margin-top: 20px; padding: 12px; background: #f5f5f5;
      border-radius: 8px; }
    .test-accounts p { margin: 0 0 8px; font-size: 0.85rem; color: #555; }
    .test-accounts button { margin-right: 8px; font-size: 0.8rem; }
    mat-card-footer { padding: 16px; text-align: center; }
    mat-card-footer a { color: #1565c0; font-weight: 600; text-decoration: none; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private wsService: WebSocketService,
    private toast: ToastService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.wsService.connect();
        this.toast.success('Connexion réussie !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }

  fillAdmin() { this.form.setValue({ email: 'admin@digitalsolutions.com', password: 'admin123' }); }
}
