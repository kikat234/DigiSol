import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, Task } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="welcome-banner">
        <div>
          <h1>Bonjour, {{ user?.prenom || user?.nom }} </h1>
          <p>Voici un aperçu de votre espace de travail</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/projects/new">
          <mat-icon>add</mat-icon> Nouveau Projet
        </button>
      </div>

      <!-- Stats globales -->
      <div class="stats-grid">
        <mat-card class="stat-card blue">
          <mat-icon>work</mat-icon>
          <div class="stat-value">{{ stats?.totalProjets ?? '—' }}</div>
          <div class="stat-label">Projets Total</div>
        </mat-card>
        <mat-card class="stat-card green">
          <mat-icon>play_circle</mat-icon>
          <div class="stat-value">{{ stats?.projetsEnCours ?? '—' }}</div>
          <div class="stat-label">En cours</div>
        </mat-card>
        <mat-card class="stat-card purple">
          <mat-icon>check_circle</mat-icon>
          <div class="stat-value">{{ stats?.projetsTermines ?? '—' }}</div>
          <div class="stat-label">Terminés</div>
        </mat-card>
        <mat-card class="stat-card orange">
          <mat-icon>people</mat-icon>
          <div class="stat-value">{{ stats?.totalUtilisateurs ?? '—' }}</div>
          <div class="stat-label">Utilisateurs</div>
        </mat-card>
      </div>

      <div class="dashboard-grid">
        <!-- Mes tâches -->
        <mat-card class="tasks-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>assignment</mat-icon> Mes tâches
            </mat-card-title>
            <button mat-button routerLink="/my-tasks" color="primary">Voir tout</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="myTasks.length === 0" class="empty-state">
              <mat-icon>check_circle_outline</mat-icon>
              <p>Aucune tâche assignée</p>
            </div>
            <div *ngFor="let task of myTasks.slice(0, 5)" class="task-item"
                 [routerLink]="['/projects', task.projetId, 'board']">
              <div class="task-left">
                <span class="priority-dot" [class]="'p-' + task.priorite.toLowerCase()"></span>
                <div>
                  <div class="task-titre">{{ task.titre }}</div>
                  <div class="task-projet">{{ task.projetTitre }}</div>
                </div>
              </div>
              <span class="status-chip" [class]="'s-' + task.statut.toLowerCase()">
                {{ getStatutLabel(task.statut) }}
              </span>
            </div>

            <!-- Barre de progression tâches -->
            <div *ngIf="myTasks.length > 0" class="progress-section">
              <div class="progress-label">
                <span>Progression</span>
                <span>{{ tasksDonePercent }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="tasksDonePercent"
                color="primary"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Mes projets récents -->
        <mat-card class="projects-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>folder</mat-icon> Mes projets récents
            </mat-card-title>
            <button mat-button routerLink="/projects" color="primary">Voir tout</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentProjects.length === 0" class="empty-state">
              <mat-icon>folder_open</mat-icon>
              <p>Aucun projet pour l'instant</p>
            </div>
            <div *ngFor="let p of recentProjects" class="project-item"
                 [routerLink]="['/projects', p.id]">
              <div class="project-header-row">
                <span class="project-titre">{{ p.titre }}</span>
                <span class="statut-badge" [class]="'st-' + p.statut.toLowerCase()">
                  {{ getStatutLabel2(p.statut) }}
                </span>
              </div>
              <div class="project-meta">
                <span><mat-icon>task_alt</mat-icon> {{ p.totalTaches }} tâches</span>
                <span><mat-icon>people</mat-icon> {{ p.membres.length }} membres</span>
              </div>
              <mat-progress-bar mode="determinate"
                [value]="p.totalTaches > 0 ? (p.tachesTerminees / p.totalTaches) * 100 : 0">
              </mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Chart simplifié tâches par statut -->
      <mat-card class="chart-card" *ngIf="myTasks.length > 0">
        <mat-card-header>
          <mat-card-title><mat-icon>bar_chart</mat-icon> Répartition de mes tâches</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-bars">
            <div class="bar-item" *ngFor="let item of taskChartData">
              <div class="bar-fill" [style.height.%]="item.pct" [style.background]="item.color"></div>
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-value">{{ item.count }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .welcome-banner { display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 28px; }
    .welcome-banner h1 { margin: 0; font-size: 1.8rem; color: #1a1a1a; }
    .welcome-banner p { margin: 4px 0 0; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      margin-bottom: 24px; }
    .stat-card { display: flex; flex-direction: column; align-items: center;
      padding: 24px; gap: 8px; border-radius: 12px !important; }
    .stat-card mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .stat-value { font-size: 2.2rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.85rem; color: #555; }
    .stat-card.blue { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
    .stat-card.blue mat-icon, .stat-card.blue .stat-value { color: #1565c0; }
    .stat-card.green { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
    .stat-card.green mat-icon, .stat-card.green .stat-value { color: #2e7d32; }
    .stat-card.purple { background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
    .stat-card.purple mat-icon, .stat-card.purple .stat-value { color: #6a1b9a; }
    .stat-card.orange { background: linear-gradient(135deg, #fff3e0, #ffe0b2); }
    .stat-card.orange mat-icon, .stat-card.orange .stat-value { color: #e65100; }
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      margin-bottom: 24px; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 1rem !important; }
    .task-item { display: flex; align-items: center; justify-content: space-between;
      padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
    .task-item:hover { background: #f5f5f5; }
    .task-left { display: flex; align-items: center; gap: 10px; }
    .priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .p-basse { background: #4caf50; }
    .p-normale { background: #2196f3; }
    .p-haute { background: #ff9800; }
    .p-urgente { background: #f44336; }
    .task-titre { font-size: 0.9rem; font-weight: 500; }
    .task-projet { font-size: 0.75rem; color: #888; }
    .status-chip { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .s-a_faire { background: #fafafa; color: #555; border: 1px solid #ddd; }
    .s-en_cours { background: #e3f2fd; color: #1565c0; }
    .s-termine { background: #e8f5e9; color: #2e7d32; }
    .progress-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
    .progress-label { display: flex; justify-content: space-between;
      font-size: 0.85rem; margin-bottom: 6px; color: #555; }
    .project-item { padding: 12px; border-radius: 8px; cursor: pointer;
      transition: background 0.2s; margin-bottom: 8px; }
    .project-item:hover { background: #f5f5f5; }
    .project-header-row { display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 6px; }
    .project-titre { font-weight: 600; font-size: 0.95rem; }
    .statut-badge { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; }
    .st-en_cours { background: #e3f2fd; color: #1565c0; }
    .st-termine { background: #e8f5e9; color: #2e7d32; }
    .st-en_pause { background: #fff3e0; color: #e65100; }
    .st-annule { background: #ffebee; color: #c62828; }
    .project-meta { display: flex; gap: 12px; font-size: 0.8rem; color: #888;
      margin-bottom: 8px; }
    .project-meta span { display: flex; align-items: center; gap: 2px; }
    .project-meta mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .empty-state { text-align: center; padding: 32px; color: #aaa; }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }
    .chart-card { margin-bottom: 24px; }
    .chart-bars { display: flex; gap: 24px; align-items: flex-end;
      height: 120px; padding: 16px 0 0; }
    .bar-item { display: flex; flex-direction: column; align-items: center;
      gap: 4px; flex: 1; }
    .bar-fill { width: 60px; border-radius: 6px 6px 0 0; min-height: 4px;
      transition: height 0.5s; }
    .bar-label { font-size: 0.8rem; color: #555; }
    .bar-value { font-size: 1.1rem; font-weight: 700; }
    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .welcome-banner { flex-direction: column; gap: 12px; align-items: flex-start; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  myTasks: Task[] = [];
  recentProjects: Project[] = [];

  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  get user() { return this.authService.currentUser(); }

  get tasksDonePercent() {
    if (!this.myTasks.length) return 0;
    const done = this.myTasks.filter(t => t.statut === 'TERMINE').length;
    return Math.round((done / this.myTasks.length) * 100);
  }

  get taskChartData() {
    const aFaire = this.myTasks.filter(t => t.statut === 'A_FAIRE').length;
    const enCours = this.myTasks.filter(t => t.statut === 'EN_COURS').length;
    const termine = this.myTasks.filter(t => t.statut === 'TERMINE').length;
    const max = Math.max(aFaire, enCours, termine, 1);
    return [
      { label: 'À faire', count: aFaire, pct: (aFaire / max) * 100, color: '#90a4ae' },
      { label: 'En cours', count: enCours, pct: (enCours / max) * 100, color: '#42a5f5' },
      { label: 'Terminé', count: termine, pct: (termine / max) * 100, color: '#66bb6a' }
    ];
  }

  ngOnInit() {
    forkJoin({
      stats: this.projectService.getDashboardStats(),
      tasks: this.taskService.getMyTasks(),
      projects: this.projectService.getMesProjets(0, 5)
    }).subscribe(({ stats, tasks, projects }) => {
      this.stats = stats;
      this.myTasks = tasks;
      this.recentProjects = projects.content;
    });
  }

  getStatutLabel(s: string): string {
    return { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé' }[s] || s;
  }
  getStatutLabel2(s: string): string {
    return { EN_COURS: 'En cours', TERMINE: 'Terminé', EN_PAUSE: 'En pause', ANNULE: 'Annulé' }[s] || s;
  }
}
