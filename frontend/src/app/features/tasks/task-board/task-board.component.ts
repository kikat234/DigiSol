import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Task, User, Commentaire } from '../../../core/models/models';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule,
    MatChipsModule, MatDatepickerModule, MatNativeDateModule, DragDropModule],
  template: `
    <div class="board-container">
      <!-- Header -->
      <div class="board-header">
        <div class="header-left">
          <button mat-icon-button *ngIf="projetId" [routerLink]="['/projects', projetId]">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>
            <mat-icon>view_kanban</mat-icon>
            {{ projetId ? 'Tableau Kanban' : 'Mes Tâches' }}
          </h1>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="filter-field" *ngIf="allUsers.length">
            <mat-label>Filtrer par membre</mat-label>
            <mat-select [(ngModel)]="filterUserId" (ngModelChange)="applyFilters()">
              <mat-option [value]="null">Tous</mat-option>
              <mat-option *ngFor="let u of allUsers" [value]="u.id">
                {{ u.prenom }} {{ u.nom }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" *ngIf="projetId"
            (click)="openTaskForm()">
            <mat-icon>add</mat-icon> Nouvelle tâche
          </button>
        </div>
      </div>

      <!-- Kanban columns -->
      <div class="kanban-board" *ngIf="!loading">
        <!-- À faire -->
        <div class="kanban-col">
          <div class="col-header a-faire">
            <mat-icon>radio_button_unchecked</mat-icon>
            <span>À faire</span>
            <span class="count">{{ aFaire.length }}</span>
          </div>
          <div class="tasks-list" cdkDropList id="A_FAIRE"
            [cdkDropListData]="aFaire"
            [cdkDropListConnectedTo]="['EN_COURS','TERMINE']"
            (cdkDropListDropped)="drop($event)">
            <div *ngFor="let task of aFaire" cdkDrag class="task-card"
              (click)="openTaskDetail(task)">
              <ng-container *ngTemplateOutlet="taskCard; context: { task }"></ng-container>
            </div>
            <div *cdkDragPlaceholder class="drag-placeholder"></div>
          </div>
          <button mat-button class="add-task-btn" *ngIf="projetId" (click)="openTaskForm('A_FAIRE')">
            <mat-icon>add</mat-icon> Ajouter une tâche
          </button>
        </div>

        <!-- En cours -->
        <div class="kanban-col">
          <div class="col-header en-cours">
            <mat-icon>timelapse</mat-icon>
            <span>En cours</span>
            <span class="count">{{ enCours.length }}</span>
          </div>
          <div class="tasks-list" cdkDropList id="EN_COURS"
            [cdkDropListData]="enCours"
            [cdkDropListConnectedTo]="['A_FAIRE','TERMINE']"
            (cdkDropListDropped)="drop($event)">
            <div *ngFor="let task of enCours" cdkDrag class="task-card"
              (click)="openTaskDetail(task)">
              <ng-container *ngTemplateOutlet="taskCard; context: { task }"></ng-container>
            </div>
          </div>
          <button mat-button class="add-task-btn" *ngIf="projetId" (click)="openTaskForm('EN_COURS')">
            <mat-icon>add</mat-icon> Ajouter une tâche
          </button>
        </div>

        <!-- Terminé -->
        <div class="kanban-col">
          <div class="col-header termine">
            <mat-icon>check_circle</mat-icon>
            <span>Terminé</span>
            <span class="count">{{ termine.length }}</span>
          </div>
          <div class="tasks-list" cdkDropList id="TERMINE"
            [cdkDropListData]="termine"
            [cdkDropListConnectedTo]="['A_FAIRE','EN_COURS']"
            (cdkDropListDropped)="drop($event)">
            <div *ngFor="let task of termine" cdkDrag class="task-card done"
              (click)="openTaskDetail(task)">
              <ng-container *ngTemplateOutlet="taskCard; context: { task }"></ng-container>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Template carte tâche -->
      <ng-template #taskCard let-task="task">
        <div class="priority-bar" [class]="'p-' + task.priorite?.toLowerCase()"></div>
        <div class="task-body">
          <div class="task-title">{{ task.titre }}</div>
          <div *ngIf="task.description" class="task-desc">{{ task.description }}</div>

          <div class="task-meta">
            <span *ngIf="task.echeance" class="echeance"
              [class.overdue]="isOverdue(task.echeance)">
              <mat-icon>event</mat-icon> {{ task.echeance | date:'dd/MM' }}
            </span>
            <span *ngIf="task.nombreCommentaires > 0" class="comment-count">
              <mat-icon>comment</mat-icon> {{ task.nombreCommentaires }}
            </span>
          </div>

          <div class="task-footer">
            <span class="priority-tag" [class]="'pt-' + task.priorite?.toLowerCase()">
              {{ getPrioriteLabel(task.priorite) }}
            </span>
            <div *ngIf="task.assigneA" class="assignee"
              [title]="task.assigneA.nom">
              {{ (task.assigneA.prenom?.[0] || '') + task.assigneA.nom[0] }}
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Panel tâche sélectionnée -->
      <div class="task-panel" *ngIf="selectedTask" (click)="selectedTask = undefined">
        <div class="panel-content" (click)="$event.stopPropagation()">
          <div class="panel-header">
            <h2>{{ selectedTask.titre }}</h2>
            <button mat-icon-button (click)="selectedTask = undefined"><mat-icon>close</mat-icon></button>
          </div>

          <div class="panel-body">
            <p *ngIf="selectedTask.description">{{ selectedTask.description }}</p>

            <div class="detail-row">
              <span class="detail-label">Statut</span>
              <mat-select [(ngModel)]="selectedTask.statut"
                (ngModelChange)="changeStatut(selectedTask, $event)">
                <mat-option value="A_FAIRE">À faire</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="TERMINE">Terminé</mat-option>
              </mat-select>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priorité</span>
              <span class="priority-tag" [class]="'pt-' + selectedTask.priorite.toLowerCase()">
                {{ getPrioriteLabel(selectedTask.priorite) }}
              </span>
            </div>
            <div class="detail-row" *ngIf="selectedTask.assigneA">
              <span class="detail-label">Assigné à</span>
              <span>{{ selectedTask.assigneA.prenom }} {{ selectedTask.assigneA.nom }}</span>
            </div>
            <div class="detail-row" *ngIf="selectedTask.echeance">
              <span class="detail-label">Échéance</span>
              <span [class.overdue-text]="isOverdue(selectedTask.echeance)">
                {{ selectedTask.echeance | date:'dd/MM/yyyy' }}
              </span>
            </div>

            <!-- Actions -->
            <div class="panel-actions" *ngIf="projetId">
              <button mat-stroked-button (click)="openTaskForm(undefined, selectedTask)">
                <mat-icon>edit</mat-icon> Modifier
              </button>
              <button mat-stroked-button color="warn" (click)="deleteTask(selectedTask)">
                <mat-icon>delete</mat-icon> Supprimer
              </button>
            </div>

            <!-- Commentaires -->
            <div class="comments-section">
              <h3><mat-icon>comment</mat-icon> Commentaires</h3>
              <div *ngFor="let c of commentaires" class="comment-item">
                <div class="comment-avatar">{{ (c.auteur.prenom?.[0] || '') + c.auteur.nom[0] }}</div>
                <div class="comment-body">
                  <div class="comment-meta">
                    <strong>{{ c.auteur.prenom }} {{ c.auteur.nom }}</strong>
                    <span>{{ c.dateCreation | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <p>{{ c.contenu }}</p>
                </div>
              </div>
              <div class="add-comment">
                <input [(ngModel)]="newComment" placeholder="Ajouter un commentaire..."
                  (keyup.enter)="addComment()">
                <button mat-icon-button color="primary" [disabled]="!newComment.trim()"
                  (click)="addComment()">
                  <mat-icon>send</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Modal Tâche -->
      <div class="modal-overlay" *ngIf="showTaskForm" (click)="showTaskForm = false">
        <mat-card class="modal-card" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-card-title>{{ editingTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}</mat-card-title>
            <button mat-icon-button (click)="showTaskForm = false"><mat-icon>close</mat-icon></button>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Titre *</mat-label>
                <input matInput formControlName="titre">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="A_FAIRE">À faire</mat-option>
                    <mat-option value="EN_COURS">En cours</mat-option>
                    <mat-option value="TERMINE">Terminé</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Priorité</mat-label>
                  <mat-select formControlName="priorite">
                    <mat-option value="BASSE">Basse</mat-option>
                    <mat-option value="NORMALE">Normale</mat-option>
                    <mat-option value="HAUTE">Haute</mat-option>
                    <mat-option value="URGENTE">Urgente</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Assigner à</mat-label>
                  <mat-select formControlName="assigneAId">
                    <mat-option [value]="null">Non assigné</mat-option>
                    <mat-option *ngFor="let u of allUsers" [value]="u.id">
                      {{ u.prenom }} {{ u.nom }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Échéance</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="echeance">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="modal-actions">
                <button mat-stroked-button type="button" (click)="showTaskForm = false">Annuler</button>
                <button mat-raised-button color="primary" type="submit"
                  [disabled]="taskForm.invalid || saving">
                  {{ saving ? 'Enregistrement...' : (editingTask ? 'Modifier' : 'Créer') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .board-container { padding: 24px; max-width: 1400px; margin: 0 auto; position: relative; }
    .board-header { display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-left h1 { display: flex; align-items: center; gap: 8px; margin: 0;
      font-size: 1.5rem; color: #1565c0; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .filter-field { width: 200px; }
    .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; min-height: 60vh; }
    .kanban-col { display: flex; flex-direction: column; gap: 0; }
    .col-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      border-radius: 10px 10px 0 0; font-weight: 700; font-size: 0.95rem; }
    .col-header .count { margin-left: auto; background: rgba(0,0,0,0.15);
      border-radius: 12px; padding: 2px 10px; font-size: 0.8rem; }
    .a-faire { background: #eceff1; color: #546e7a; }
    .en-cours { background: #e3f2fd; color: #1565c0; }
    .termine { background: #e8f5e9; color: #2e7d32; }
    .tasks-list { flex: 1; min-height: 120px; padding: 8px;
      background: rgba(0,0,0,0.02); border-left: 1px solid #eee; border-right: 1px solid #eee; }
    .task-card { background: white; border-radius: 8px; margin-bottom: 8px;
      cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.15s, box-shadow 0.15s; overflow: hidden;
      display: flex; gap: 0; }
    .task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .task-card.done { opacity: 0.7; }
    .priority-bar { width: 4px; flex-shrink: 0; border-radius: 0; }
    .p-basse .priority-bar, .p-basse { background: #4caf50; }
    .p-normale .priority-bar { background: #2196f3; }
    .p-haute .priority-bar { background: #ff9800; }
    .p-urgente .priority-bar { background: #f44336; }
    .task-body { padding: 10px 12px; flex: 1; }
    .task-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
    .task-desc { font-size: 0.78rem; color: #888; margin-bottom: 6px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .task-meta { display: flex; gap: 8px; align-items: center; font-size: 0.75rem;
      color: #888; margin-bottom: 6px; }
    .task-meta mat-icon { font-size: 12px; width: 12px; height: 12px; }
    .echeance { display: flex; align-items: center; gap: 2px; }
    .echeance.overdue { color: #c62828; }
    .comment-count { display: flex; align-items: center; gap: 2px; }
    .task-footer { display: flex; justify-content: space-between; align-items: center; }
    .priority-tag { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }
    .pt-basse { background: #e8f5e9; color: #2e7d32; }
    .pt-normale { background: #e3f2fd; color: #1565c0; }
    .pt-haute { background: #fff3e0; color: #e65100; }
    .pt-urgente { background: #ffebee; color: #c62828; }
    .assignee { width: 26px; height: 26px; border-radius: 50%; background: #1565c0;
      color: white; font-size: 0.65rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; }
    .add-task-btn { width: 100%; margin-top: 4px; color: #888; font-size: 0.85rem;
      background: rgba(0,0,0,0.02); border: 1px dashed #ddd; border-radius: 0 0 8px 8px; }
    .drag-placeholder { background: #e3f2fd; border: 2px dashed #42a5f5;
      border-radius: 8px; height: 80px; margin-bottom: 8px; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0,0,0.2,1); }
    /* Side panel */
    .task-panel { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 200;
      background: rgba(0,0,0,0.4); display: flex; justify-content: flex-end; }
    .panel-content { width: min(480px, 100%); background: white; height: 100%;
      overflow-y: auto; display: flex; flex-direction: column; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start;
      padding: 20px; border-bottom: 1px solid #eee; gap: 12px; }
    .panel-header h2 { margin: 0; font-size: 1.2rem; }
    .panel-body { padding: 20px; flex: 1; }
    .detail-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
      font-size: 0.9rem; }
    .detail-label { width: 80px; color: #888; flex-shrink: 0; font-size: 0.8rem; }
    .panel-actions { display: flex; gap: 8px; margin: 16px 0; }
    .comments-section { border-top: 1px solid #eee; padding-top: 16px; margin-top: 8px; }
    .comments-section h3 { display: flex; align-items: center; gap: 6px;
      margin: 0 0 12px; font-size: 0.95rem; }
    .comment-item { display: flex; gap: 10px; margin-bottom: 12px; }
    .comment-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1565c0;
      color: white; font-size: 0.65rem; font-weight: 700; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0; }
    .comment-body { flex: 1; }
    .comment-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 2px; }
    .comment-meta strong { font-size: 0.85rem; }
    .comment-meta span { font-size: 0.75rem; color: #aaa; }
    .comment-body p { margin: 0; font-size: 0.85rem; color: #444; }
    .add-comment { display: flex; gap: 8px; align-items: center; margin-top: 12px;
      background: #f5f5f5; border-radius: 8px; padding: 4px 4px 4px 12px; }
    .add-comment input { flex: 1; border: none; background: transparent; outline: none;
      font-size: 0.9rem; }
    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 300;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-card { width: min(560px, calc(100% - 32px)); max-height: 90vh; overflow-y: auto; }
    .modal-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-row { display: flex; gap: 12px; }
    .form-row mat-form-field { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .overdue-text { color: #c62828; font-weight: 600; }
    @media (max-width: 900px) { .kanban-board { grid-template-columns: 1fr; } }
  `]
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  projetId?: number;
  allTasks: Task[] = [];
  aFaire: Task[] = [];
  enCours: Task[] = [];
  termine: Task[] = [];
  allUsers: User[] = [];
  filterUserId: number | null = null;
  loading = false;
  saving = false;
  selectedTask?: Task;
  commentaires: Commentaire[] = [];
  newComment = '';
  showTaskForm = false;
  editingTask?: Task;
  defaultStatut = 'A_FAIRE';
  private wsUnsub?: () => void;

  taskForm = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    statut: ['A_FAIRE'],
    priorite: ['NORMALE'],
    assigneAId: [null as number | null],
    echeance: [null as Date | null]
  });

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private authService: AuthService,
    private toast: ToastService,
    private wsService: WebSocketService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.projetId = this.route.snapshot.params['id']
      ? +this.route.snapshot.params['id'] : undefined;

    this.authService.getAllUsers().subscribe(u => this.allUsers = u);
    this.load();

    if (this.projetId) {
      this.wsUnsub = this.wsService.subscribeToProject(this.projetId, () => this.load());
    }
  }

  load() {
    this.loading = true;
    const obs = this.projetId
      ? this.taskService.getByProject(this.projetId)
      : this.taskService.getMyTasks();

    obs.subscribe({
      next: tasks => { this.allTasks = tasks; this.applyFilters(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    let tasks = this.allTasks;
    if (this.filterUserId) {
      tasks = tasks.filter(t => t.assigneA?.id === this.filterUserId);
    }
    this.aFaire = tasks.filter(t => t.statut === 'A_FAIRE').sort((a, b) => a.ordreKanban - b.ordreKanban);
    this.enCours = tasks.filter(t => t.statut === 'EN_COURS').sort((a, b) => a.ordreKanban - b.ordreKanban);
    this.termine = tasks.filter(t => t.statut === 'TERMINE').sort((a, b) => a.ordreKanban - b.ordreKanban);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data,
        event.previousIndex, event.currentIndex);
      const task = event.container.data[event.currentIndex];
      const newStatut = event.container.id as string;
      this.taskService.updateStatut(task.id, newStatut).subscribe({
        next: () => this.toast.info(`Tâche déplacée vers "${this.getStatutLabel(newStatut)}"`),
        error: () => { this.toast.error('Erreur'); this.load(); }
      });
    }
  }

  openTaskDetail(task: Task) {
    this.selectedTask = { ...task };
    this.taskService.getCommentaires(task.id).subscribe(c => this.commentaires = c);
  }

  openTaskForm(statut?: string, task?: Task) {
    this.editingTask = task;
    this.defaultStatut = statut || 'A_FAIRE';
    this.showTaskForm = true;
    if (task) {
      this.taskForm.patchValue({
        titre: task.titre, description: task.description || '',
        statut: task.statut, priorite: task.priorite,
        assigneAId: task.assigneA?.id || null,
        echeance: task.echeance ? new Date(task.echeance) : null
      });
    } else {
      this.taskForm.reset({ statut: this.defaultStatut, priorite: 'NORMALE' });
    }
  }

  saveTask() {
    if (this.taskForm.invalid || !this.projetId) return;
    this.saving = true;
    const val = this.taskForm.value;
    const payload = { ...val, echeance: val.echeance ? new Date(val.echeance!).toISOString().split('T')[0] : null };

    const obs = this.editingTask
      ? this.taskService.update(this.editingTask.id, payload)
      : this.taskService.create(this.projetId, payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingTask ? 'Tâche modifiée' : 'Tâche créée');
        this.showTaskForm = false;
        this.saving = false;
        this.load();
      },
      error: (err) => { this.saving = false; this.toast.error(err.error?.message || 'Erreur'); }
    });
  }

  changeStatut(task: Task, statut: string) {
    this.taskService.updateStatut(task.id, statut).subscribe({
      next: () => { this.toast.success('Statut mis à jour'); this.load(); },
      error: () => this.toast.error('Erreur')
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`Supprimer la tâche "${task.titre}" ?`)) return;
    this.taskService.delete(task.id).subscribe({
      next: () => { this.toast.success('Tâche supprimée'); this.selectedTask = undefined; this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.selectedTask) return;
    this.taskService.addCommentaire(this.selectedTask.id, this.newComment).subscribe({
      next: (c) => {
        this.commentaires.push(c);
        this.newComment = '';
        if (this.selectedTask) this.selectedTask.nombreCommentaires++;
      },
      error: () => this.toast.error('Erreur lors de l\'ajout')
    });
  }

  isOverdue(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }

  getStatutLabel(s: string): string {
    return { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé' }[s] || s;
  }
  getPrioriteLabel(p: string): string {
    return { BASSE: 'Basse', NORMALE: 'Normale', HAUTE: 'Haute', URGENTE: 'Urgente' }[p] || p;
  }

  ngOnDestroy() { this.wsUnsub?.(); }
}
