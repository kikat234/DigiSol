import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Commentaire } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByProject(projetId: number, statut?: string, assigneAId?: number): Observable<Task[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (assigneAId) params = params.set('assigneAId', assigneAId);
    return this.http.get<Task[]>(`${this.apiUrl}/projects/${projetId}/tasks`, { params });
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/mes-taches`);
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  create(projetId: number, data: any): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/projects/${projetId}/tasks`, data);
  }

  update(id: number, data: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, data);
  }

  updateStatut(id: number, statut: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}/statut`, { statut });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }

  // Commentaires
  getCommentaires(tacheId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/tasks/${tacheId}/commentaires`);
  }

  addCommentaire(tacheId: number, contenu: string): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/tasks/${tacheId}/commentaires`, { contenu });
  }

  deleteCommentaire(tacheId: number, commentaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${tacheId}/commentaires/${commentaireId}`);
  }
}
