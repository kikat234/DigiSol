import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Project, User } from '../../../core/models/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatTabsModule, MatChipsModule, MatProgressBarModule,
    MatListModule, MatSelectModule, MatFormFieldModule, FormsModule],
  template: `
    <div class="page-container" *ngIf="project">
      <!-- Header -->
      <div class="project-header">
        <div class="header-left">
          <button mat-icon-button routerLink="/projects">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-icon" [class]="'bg-' + (project.id % 5)">
            {{ project.titre[0].toUpperCase() }}
          </div>
          <div>
            <h1>{{ project.titre }}</h1>
            <span class="statut-badge" [class]="'st-' + project.statut.toLowerCase()">
              {{ getStatutLabel(project.statut) }}
            </span>
          </div>
        </div>
        <div class="header-actions" *ngIf="canEdit">
          <button mat-stroked-button [routerLink]="['/projects', project.id, 'board']">
            <mat-icon>view_kanban</mat-icon> Kanban
          </button>
          <button mat-stroked-button [routerLink]="['/projects', project.id, 'edit']">
            <mat-icon>edit</mat-icon> Modifier
          </button>
          <button mat-raised-button color="warn" (click)="deleteProject()">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="quick-stats">
        <div class="qs-item">
          <span class="qs-val">{{ project.totalTaches }}</span>
          <span class="qs-lbl">Total tâches</span>
        </div>
        <div class="qs-item green">
          <span class="qs-val">{{ project.tachesTerminees }}</span>
          <span class="qs-lbl">Terminées</span>
        </div>
        <div class="qs-item blue">
          <span class="qs-val">{{ project.tachesEnCours }}</span>
          <span class="qs-lbl">En cours</span>
        </div>
        <div class="qs-item orange">
          <span class="qs-val">{{ project.tachesAFaire }}</span>
          <span class="qs-lbl">À faire</span>
        </div>
        <div class="qs-item purple">
          <span class="qs-val">{{ project.membres.length }}</span>
          <span class="qs-lbl">Membres</span>
        </div>
      </div>

      <mat-progress-bar
        [value]="project.totalTaches > 0 ? (project.tachesTerminees / project.totalTaches) * 100 : 0"
        color="primary" style="margin-bottom: 24px; border-radius: 4px; height: 8px;">
      </mat-progress-bar>

      <!-- Onglets -->
      <mat-tab-group>
        <!-- Description -->
        <mat-tab label="Description">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <p *ngIf="project.description">{{ project.description }}</p>
                <p *ngIf="!project.description" style="color:#aaa">Aucune description renseignée.</p>
                <div class="meta-info">
                  <div><strong>Créé par :</strong> {{ project.createur.nom }} {{ project.createur.prenom }}</div>
                  <div><strong>Date création :</strong> {{ project.dateCreation | date:'dd/MM/yyyy HH:mm' }}</div>
                  <div><strong>Dernière mise à jour :</strong> {{ project.dateMiseAJour | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Membres -->
        <mat-tab label="Membres ({{ project.membres.length }})">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Membres de l'équipe</mat-card-title>
                <button mat-stroked-button *ngIf="canEdit && availableUsers.length > 0"
                  (click)="showAddMember = !showAddMember">
                  <mat-icon>person_add</mat-icon> Ajouter
                </button>
              </mat-card-header>
              <mat-card-content>
                <!-- Sélecteur ajout membre -->
                <div *ngIf="showAddMember && canEdit" class="add-member-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Choisir un utilisateur</mat-label>
                    <mat-select [(ngModel)]="selectedUserId">
                      <mat-option *ngFor="let u of availableUsers" [value]="u.id">
                        {{ u.prenom }} {{ u.nom }} ({{ u.email }})
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button color="primary"
                    [disabled]="!selectedUserId" (click)="addMember()">
                    Ajouter
                  </button>
                </div>

                <mat-list>
                  <mat-list-item *ngFor="let m of project.membres">
                    <div class="member-row">
                      <div class="member-avatar">{{ (m.prenom?.[0] || '') + m.nom[0] }}</div>
                      <div class="member-info">
                        <span class="member-name">{{ m.prenom }} {{ m.nom }}</span>
                        <span class="member-email">{{ m.email }}</span>
                      </div>
                      <span class="role-chip" [class.admin]="m.role === 'ADMIN'">{{ m.role }}</span>
                      <button mat-icon-button color="warn"
                        *ngIf="canEdit && m.id !== project.createur.id"
                        (click)="removeMember(m)">
                        <mat-icon>remove_circle_outline</mat-icon>
                      </button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Loading -->
    <div *ngIf="!project" class="loading-center">
      <mat-icon style="font-size:3rem;width:3rem;height:3rem;color:#ddd">work</mat-icon>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .project-header { display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-icon { width: 52px; height: 52px; border-radius: 12px; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; }
    .bg-0 { background: linear-gradient(135deg,#1565c0,#42a5f5); }
    .bg-1 { background: linear-gradient(135deg,#2e7d32,#66bb6a); }
    .bg-2 { background: linear-gradient(135deg,#6a1b9a,#ab47bc); }
    .bg-3 { background: linear-gradient(135deg,#e65100,#ffa726); }
    .bg-4 { background: linear-gradient(135deg,#c62828,#ef5350); }
    .header-left h1 { margin: 0 0 4px; font-size: 1.5rem; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .statut-badge { padding: 3px 12px; border-radius: 16px; font-size: 0.75rem; font-weight: 600; }
    .st-en_cours { background: #e3f2fd; color: #1565c0; }
    .st-termine { background: #e8f5e9; color: #2e7d32; }
    .st-en_pause { background: #fff3e0; color: #e65100; }
    .st-annule { background: #ffebee; color: #c62828; }
    .quick-stats { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
    .qs-item { display: flex; flex-direction: column; align-items: center;
      padding: 12px 20px; background: #f5f5f5; border-radius: 10px; min-width: 80px; }
    .qs-item.green { background: #e8f5e9; }
    .qs-item.blue { background: #e3f2fd; }
    .qs-item.orange { background: #fff3e0; }
    .qs-item.purple { background: #f3e5f5; }
    .qs-val { font-size: 1.5rem; font-weight: 700; }
    .qs-lbl { font-size: 0.75rem; color: #666; }
    .tab-content { padding: 20px 0; }
    .meta-info { margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;
      display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem; color: #555; }
    .add-member-form { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .member-row { display: flex; align-items: center; gap: 12px; width: 100%; }
    .member-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1565c0;
      color: white; font-size: 0.8rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .member-info { display: flex; flex-direction: column; flex: 1; }
    .member-name { font-weight: 600; font-size: 0.9rem; }
    .member-email { font-size: 0.8rem; color: #888; }
    .role-chip { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem;
      background: #e3f2fd; color: #1565c0; }
    .role-chip.admin { background: #fce4ec; color: #c62828; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }
  `]
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project?: Project;
  allUsers: User[] = [];
  showAddMember = false;
  selectedUserId?: number;
  private wsUnsub?: () => void;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private toast: ToastService,
    private wsService: WebSocketService
  ) {}

  get canEdit(): boolean {
    const u = this.authService.currentUser();
    return !!this.project && (u?.id === this.project.createur.id || u?.role === 'ADMIN');
  }

  get availableUsers(): User[] {
    if (!this.project) return [];
    const memberIds = new Set(this.project.membres.map(m => m.id));
    return this.allUsers.filter(u => !memberIds.has(u.id));
  }

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.load(id);
    this.authService.getAllUsers().subscribe(users => this.allUsers = users);

    this.wsUnsub = this.wsService.subscribeToProject(id, () => this.load(id));
  }

  load(id: number) {
    this.projectService.getById(id).subscribe(p => this.project = p);
  }

  addMember() {
    if (!this.selectedUserId || !this.project) return;
    this.projectService.addMembre(this.project.id, this.selectedUserId).subscribe({
      next: (p) => {
        this.project = p;
        this.showAddMember = false;
        this.selectedUserId = undefined;
        this.toast.success('Membre ajouté !');
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  removeMember(user: User) {
    if (!this.project) return;
    if (!confirm(`Retirer ${user.nom} du projet ?`)) return;
    this.projectService.removeMembre(this.project.id, user.id).subscribe({
      next: (p) => { this.project = p; this.toast.success('Membre retiré'); },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  deleteProject() {
    if (!this.project) return;
    if (!confirm(`Supprimer le projet "${this.project.titre}" ?`)) return;
    this.projectService.delete(this.project.id).subscribe({
      next: () => {
        this.toast.success('Projet supprimé');
        this.router.navigate(['/projects']);
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  getStatutLabel(s: string): string {
    return { EN_COURS: 'En cours', TERMINE: 'Terminé', EN_PAUSE: 'En pause', ANNULE: 'Annulé' }[s] || s;
  }

  ngOnDestroy() { this.wsUnsub?.(); }
}
