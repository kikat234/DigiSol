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

@Component({
  selector: 'app-register',
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
          <p class="subtitle">Créez votre compte</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom *</mat-label>
                <input matInput formControlName="nom">
                <mat-error>Nom requis</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hide ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
                <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Minimum 6 caractères</mat-hint>
              <mat-error>Minimum 6 caractères</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
              class="submit-btn" [disabled]="loading || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Créer mon compte</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
      padding: 16px; }
    .auth-card { width: 100%; max-width: 440px; padding: 24px; border-radius: 12px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .logo mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #1565c0; }
    .logo h1 { font-size: 1.5rem; margin: 0; color: #1565c0; }
    .subtitle { color: #666; margin: 0 0 24px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px; }
    mat-card-footer { padding: 16px; text-align: center; }
    mat-card-footer a { color: #1565c0; font-weight: 600; text-decoration: none; }
  `]
})
export class RegisterComponent {
  form = this.fb.group({
    prenom: [''],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  loading = false;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.register(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }
}
