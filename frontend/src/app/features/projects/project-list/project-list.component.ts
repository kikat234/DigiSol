import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // 1. Ajout de Router
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatChipsModule, MatMenuModule, MatDialogModule
  ],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1>
            <mat-icon>work</mat-icon>
            Projets
          </h1>
          <p>{{ totalElements }} projet(s) au total</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/projects/new">
          <mat-icon>add</mat-icon>
          Nouveau projet
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher un projet...</mat-label>
            <input matInput [formControl]="searchCtrl" placeholder="Titre ou description...">
            <mat-icon matPrefix>search</mat-icon>
            <button *ngIf="searchCtrl.value" mat-icon-button matSuffix
                    (click)="searchCtrl.setValue('')">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Trier par</mat-label>
            <mat-select [formControl]="sortCtrl">
              <mat-option value="dateCreation">Date création</mat-option>
              <mat-option value="titre">Titre</mat-option>
              <mat-option value="dateMiseAJour">Dernière mise à jour</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Ordre</mat-label>
            <mat-select [formControl]="directionCtrl">
              <mat-option value="desc">Décroissant</mat-option>
              <mat-option value="asc">Croissant</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Chargement des projets...</p>
      </div>

      <div *ngIf="!loading" class="projects-grid">

        <mat-card *ngFor="let project of projects" class="project-card"
                  (click)="navigate(project.id)">
          <mat-card-content>
            <div class="card-top">
              <div class="card-icon" [class]="'bg-' + (project.id % 5)">
                {{ project.titre[0].toUpperCase() }}
              </div>
              <div class="card-actions" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/projects', project.id]">
                    <mat-icon>visibility</mat-icon>
                    Voir
                  </button>
                  <button mat-menu-item [routerLink]="['/projects', project.id, 'board']">
                    <mat-icon>view_kanban</mat-icon>
                    Kanban
                  </button>
                  <button mat-menu-item [routerLink]="['/projects', project.id, 'edit']"
                          *ngIf="canEdit(project)">
                    <mat-icon>edit</mat-icon>
                    Modifier
                  </button>
                  <button mat-menu-item (click)="deleteProject(project)"
                          *ngIf="canEdit(project)" class="delete-item">
                    <mat-icon>delete</mat-icon>
                    Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>

            <h3 class="project-titre">{{ project.titre }}</h3>
            <p class="project-desc">{{ project.description || 'Aucune description' }}</p>

            <span class="statut-badge" [class]="'st-' + project.statut.toLowerCase()">
              {{ getStatutLabel(project.statut) }}
            </span>

            <div class="project-stats">
              <div class="stat">
                <span class="stat-num">{{ project.tachesTerminees }}</span>
                <span class="stat-lbl">Terminées</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ project.tachesEnCours }}</span>
                <span class="stat-lbl">En cours</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ project.tachesAFaire }}</span>
                <span class="stat-lbl">À faire</span>
              </div>
            </div>

            <mat-progress-bar
                [value]="project.totalTaches > 0
                ? (project.tachesTerminees / project.totalTaches) * 100 : 0"
                color="primary" class="progress-bar">
            </mat-progress-bar>

            <div class="card-footer">
              <div class="membres">
                <div *ngFor="let m of project.membres.slice(0, 3)" class="mini-avatar"
                     [title]="m.nom + ' ' + (m.prenom || '')">
                  {{ (m.prenom?.[0] || '') + m.nom[0] }}
                </div>
                <span *ngIf="project.membres.length > 3" class="extra-membres">
                  +{{ project.membres.length - 3 }}
                </span>
              </div>
              <span class="date">{{ project.dateCreation | date:'dd/MM/yyyy' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="projects.length === 0" class="empty-state">
          <mat-icon>folder_open</mat-icon>
          <p>Aucun projet trouvé</p>
          <button mat-raised-button color="primary" routerLink="/projects/new">
            Créer le premier projet
          </button>
        </div>
      </div>

      <mat-paginator
          *ngIf="!loading && totalElements > pageSize"
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[6, 12, 24]"
          (page)="onPageChange($event)">
      </mat-paginator>

    </div>
    `,
  styles: [`.page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 24px; }
  .page-header h1 { display: flex; align-items: center; gap: 8px; margin: 0;
    font-size: 1.6rem; color: #1565c0; }
  .page-header p { margin: 4px 0 0; color: #888; font-size: 0.9rem; }
  .filter-card { margin-bottom: 24px; padding: 16px; }
  .filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .search-field { flex: 1; min-width: 220px; }
  .loading-center { display: flex; justify-content: center; padding: 60px; }
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px; margin-bottom: 24px; }
  .project-card { cursor: pointer; border-radius: 12px !important;
    transition: transform 0.2s, box-shadow 0.2s; overflow: visible; }
  .project-card:hover { transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
  .card-top { display: flex; justify-content: space-between;
    align-items: flex-start; padding: 16px 16px 0; }
  .card-icon { width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; font-weight: 700; color: white; }
  .bg-0 { background: linear-gradient(135deg, #1565c0, #42a5f5); }
  .bg-1 { background: linear-gradient(135deg, #2e7d32, #66bb6a); }
  .bg-2 { background: linear-gradient(135deg, #6a1b9a, #ab47bc); }
  .bg-3 { background: linear-gradient(135deg, #e65100, #ffa726); }
  .bg-4 { background: linear-gradient(135deg, #c62828, #ef5350); }
  .project-titre { font-size: 1.05rem; font-weight: 700; margin: 12px 0 6px; }
  .project-desc { font-size: 0.85rem; color: #777; margin: 0 0 12px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .statut-badge { padding: 3px 12px; border-radius: 16px; font-size: 0.75rem; font-weight: 600; }
  .st-en_cours { background: #e3f2fd; color: #1565c0; }
  .st-termine { background: #e8f5e9; color: #2e7d32; }
  .st-en_pause { background: #fff3e0; color: #e65100; }
  .st-annule { background: #ffebee; color: #c62828; }
  .project-stats { display: flex; gap: 16px; margin: 14px 0 8px; }
  .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .stat-num { font-size: 1.2rem; font-weight: 700; color: #333; }
  .stat-lbl { font-size: 0.7rem; color: #888; }
  .progress-bar { margin-bottom: 14px; border-radius: 4px; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; }
  .membres { display: flex; gap: -4px; }
  .mini-avatar { width: 28px; height: 28px; border-radius: 50%;
    background: #1565c0; color: white; font-size: 0.65rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid white; margin-left: -4px; }
  .mini-avatar:first-child { margin-left: 0; }
  .extra-membres { font-size: 0.75rem; color: #888; margin-left: 6px; }
  .date { font-size: 0.75rem; color: #aaa; }
  .empty-state { grid-column: 1/-1; text-align: center; padding: 60px;
    color: #aaa; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; }
  .delete-item { color: #c62828; }
  @media (max-width: 600px) {
    .page-header { flex-direction: column; gap: 12px; }
    .filters { flex-direction: column; }
    .search-field { width: 100%; }
  }`]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  totalElements = 0;
  currentPage = 0;
  pageSize = 9;
  loading = false;

  // 2. Utilisation de types union pour accepter null (valeur par défaut des inputs)
  searchCtrl = new FormControl<string | null>('');
  sortCtrl = new FormControl<string | null>('dateCreation');
  directionCtrl = new FormControl<string | null>('desc');
  viewCtrl = new FormControl<string | null>('all');

  constructor(
      private projectService: ProjectService,
      private authService: AuthService,
      private toast: ToastService,
      private dialog: MatDialog,
      private router: Router // 3. Type correct ici au lieu de 'any'
  ) {}

  ngOnInit() {
    this.loadProjects();

    this.searchCtrl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadProjects();
    });

    this.sortCtrl.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.loadProjects());
    this.directionCtrl.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.loadProjects());
    this.viewCtrl.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => {
      this.currentPage = 0;
      this.loadProjects();
    });
  }

  loadProjects() {
    this.loading = true;
    const obs = this.viewCtrl.value === 'mine'
        ? this.projectService.getMesProjets(this.currentPage, this.pageSize)
        : this.projectService.getAll(
            this.currentPage,
            this.pageSize,
            this.sortCtrl.value || 'dateCreation', // 4. Valeur par défaut si null
            this.directionCtrl.value || 'desc',
            this.searchCtrl.value || ''
        );

    obs.subscribe({
      next: (page) => {
        this.projects = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(e: PageEvent) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadProjects();
  }

  // 5. Utilisation du Router Angular au lieu de window.location
  navigate(id: number) {
    this.router.navigate(['/projects', id]);
  }

  canEdit(p: Project): boolean {
    const u = this.authService.currentUser();
    return u?.id === p.createur.id || u?.role === 'ADMIN';
  }

  deleteProject(project: Project) {
    if (!confirm(`Supprimer le projet "${project.titre}" ? Cette action est irréversible.`))
      return;
    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.toast.success('Projet supprimé');
        this.loadProjects();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Erreur lors de la suppression')
    });
  }

  getStatutLabel(s: string): string {
    const labels: { [key: string]: string } = {
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      EN_PAUSE: 'En pause',
      ANNULE: 'Annulé'
    };
    return labels[s] || s;
  }
}