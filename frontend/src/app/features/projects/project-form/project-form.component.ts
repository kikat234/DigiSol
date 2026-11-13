import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/projects">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEdit ? 'Modifier le projet' : 'Nouveau projet' }}</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre du projet *</mat-label>
              <input matInput formControlName="titre" placeholder="Ex: Refonte site web">
              <mat-error>Titre requis (max 255 caractères)</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5"
                placeholder="Décrivez les objectifs et le périmètre du projet...">
              </textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="EN_PAUSE">En pause</mat-option>
                <mat-option value="TERMINE">Terminé</mat-option>
                <mat-option value="ANNULE">Annulé</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" routerLink="/projects">
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit"
                [disabled]="form.invalid || saving">
                <mat-spinner diameter="18" *ngIf="saving"></mat-spinner>
                <mat-icon *ngIf="!saving">{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ saving ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer le projet') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 700px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #1565c0; }
    .form-card { padding: 8px; border-radius: 12px !important; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .actions button { display: flex; align-items: center; gap: 8px; }
  `]
})
export class ProjectFormComponent implements OnInit {
  form = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    statut: ['EN_COURS']
  });
  saving = false;
  isEdit = false;
  projectId?: number;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.params['id'];
    this.isEdit = !!this.projectId;

    if (this.isEdit) {
      this.projectService.getById(this.projectId!).subscribe(p => {
        this.form.patchValue({ titre: p.titre, description: p.description, statut: p.statut });
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;

    const obs = this.isEdit
      ? this.projectService.update(this.projectId!, this.form.value)
      : this.projectService.create(this.form.value as any);

    obs.subscribe({
      next: (p) => {
        this.toast.success(this.isEdit ? 'Projet modifié !' : 'Projet créé !');
        this.router.navigate(['/projects', p.id]);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Erreur');
      }
    });
  }
}
