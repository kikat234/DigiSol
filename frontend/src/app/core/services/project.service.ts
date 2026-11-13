import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, PageResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'dateCreation',
         direction = 'desc', search = ''): Observable<PageResponse<Project>> {
    let params = new HttpParams()
      .set('page', page.toString()).set('size', size.toString())
      .set('sortBy', sortBy).set('direction', direction);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<Project>>(this.apiUrl, { params });
  }

  getMesProjets(page = 0, size = 10): Observable<PageResponse<Project>> {
    return this.http.get<PageResponse<Project>>(
      `${this.apiUrl}/mes-projets`, { params: { page, size } });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(data: { titre: string; description?: string; statut?: string }): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMembre(projetId: number, userId: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projetId}/membres/${userId}`, {});
  }

  removeMembre(projetId: number, userId: number): Observable<Project> {
    return this.http.delete<Project>(`${this.apiUrl}/${projetId}/membres/${userId}`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }
}
