import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatDividerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>person</mat-icon> Mon Profil</h1>
      </div>

      <div class="profile-grid">
        <!-- Info Card -->
        <mat-card class="info-card">
          <div class="avatar-section">
            <div class="big-avatar">{{ initials }}</div>
            <h2>{{ user?.prenom }} {{ user?.nom }}</h2>
            <span class="role-badge" [class.admin]="user?.role === 'ADMIN'">
              {{ user?.role }}
            </span>
            <p class="email">{{ user?.email }}</p>
            <p class="date">Membre depuis {{ user?.dateInscription | date:'MMMM yyyy' }}</p>
          </div>
        </mat-card>

        <!-- Edit Card -->
        <mat-card class="edit-card">
          <mat-card-header>
            <mat-card-title>Modifier mes informations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
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

              <mat-divider style="margin: 16px 0"></mat-divider>
              <h3>Changer le mot de passe</h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe actuel</mat-label>
                <input matInput type="password" formControlName="currentPassword">
                <mat-icon matPrefix>lock</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau mot de passe</mat-label>
                <input matInput type="password" formControlName="newPassword">
                <mat-icon matPrefix>lock_reset</mat-icon>
                <mat-hint>Laissez vide pour ne pas changer</mat-hint>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit"
                [disabled]="profileForm.invalid || saving" class="save-btn">
                <mat-icon>save</mat-icon>
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 960px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; margin-bottom: 24px; }
    .page-header h1 { display: flex; align-items: center; gap: 8px; margin: 0;
      font-size: 1.6rem; color: #1565c0; }
    .profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
    .avatar-section { display: flex; flex-direction: column; align-items: center;
      padding: 32px 16px; text-align: center; }
    .big-avatar { width: 96px; height: 96px; border-radius: 50%;
      background: linear-gradient(135deg, #1565c0, #42a5f5);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700; color: white; margin-bottom: 16px; }
    .avatar-section h2 { margin: 0 0 8px; font-size: 1.3rem; }
    .role-badge { padding: 4px 14px; border-radius: 16px; font-size: 0.8rem;
      font-weight: 600; background: #e3f2fd; color: #1565c0; }
    .role-badge.admin { background: #fce4ec; color: #c62828; }
    .email { color: #666; margin: 12px 0 4px; font-size: 0.9rem; }
    .date { color: #999; font-size: 0.8rem; }
    .edit-card mat-card-content { padding: 16px 0; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .save-btn { margin-top: 16px; display: flex; align-items: center; gap: 8px; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent {
  profileForm = this.fb.group({
    prenom: [''],
    nom: ['', Validators.required],
    currentPassword: [''],
    newPassword: ['']
  });
  saving = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toast: ToastService
  ) {
    const u = authService.currentUser();
    if (u) this.profileForm.patchValue({ nom: u.nom, prenom: u.prenom || '' });
  }

  get user() { return this.authService.currentUser(); }
  get initials() {
    const u = this.user;
    if (!u) return '?';
    return ((u.prenom?.[0] || '') + (u.nom?.[0] || '')).toUpperCase();
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Profil mis à jour avec succès');
        this.profileForm.patchValue({ currentPassword: '', newPassword: '' });
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Erreur lors de la mise à jour');
      }
    });
  }
}
