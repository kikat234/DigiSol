// models/user.model.ts
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  role: 'ADMIN' | 'MEMBRE';
  dateInscription?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  role: 'ADMIN' | 'MEMBRE';
  dateInscription?: string;
}

// models/project.model.ts
export interface Project {
  id: number;
  titre: string;
  description?: string;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_PAUSE' | 'ANNULE';
  createur: User;
  dateCreation: string;
  dateMiseAJour: string;
  membres: User[];
  totalTaches: number;
  tachesTerminees: number;
  tachesEnCours: number;
  tachesAFaire: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// models/task.model.ts
export interface Task {
  id: number;
  titre: string;
  description?: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  echeance?: string;
  ordreKanban: number;
  projetId: number;
  projetTitre: string;
  assigneA?: User;
  createur?: User;
  dateCreation: string;
  dateMiseAJour: string;
  nombreCommentaires: number;
}

export interface Commentaire {
  id: number;
  contenu: string;
  auteur: User;
  tacheId: number;
  dateCreation: string;
}

export interface Notification {
  type: string;
  message: string;
  projetId?: number;
  timestamp: string;
}
