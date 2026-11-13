#  Digital Solutions - Gestionnaire de Projets

Plateforme de gestion de projets collaboratifs développée avec **Spring Boot 3** (backend) et **Angular 17** (frontend).

---

##  Fonctionnalités implémentées

### Niveau 1 - Base (60%)
- ✅ **Authentification** : Inscription, connexion/déconnexion, JWT avec expiration
- ✅ **Profil utilisateur** : Visualisation et édition (nom, prénom, mot de passe)
- ✅ **Rôles** : Administrateur / Membre
- ✅ **Gestion des Projets (CRUD)** : Créer, lister (pagination), voir, modifier (créateur seulement), supprimer
- ✅ **Gestion des Tâches** : Ajouter, assigner, changer statut, filtrer par statut/assignation

### Niveau 2 - Avancé (30%)
- ✅ **Recherche instantanée** dans les projets (debounce 400ms)
- ✅ **Tri** des projets (date, titre, mise à jour) + ordre asc/desc
- ✅ **Notifications visuelles** (toasts Material par type : success/error/info/warning)
- ✅ **Drag & Drop Kanban** pour changer le statut des tâches (Angular CDK)
- ✅ **Graphiques** (statistiques tâches dans le tableau de bord)
- ✅ **Commentaires** sur les tâches
- ✅ **Notifications temps réel** via WebSockets (STOMP/SockJS)
- ✅ **Historique** des modifications de projet

### Sécurité (contraintes obligatoires)
- ✅ Hash des mots de passe avec **BCrypt**
- ✅ Validation/sanitisation des entrées (Bean Validation + `@Valid`)
- ✅ **JWT tokens** avec expiration (24h)
- ✅ **Middleware d'authentification** (JwtAuthenticationFilter)
- ✅ **Protection CORS** configurée pour Angular (localhost:4200)

---

##  Prérequis

| Outil | Version |
|---|---|
| JDK | 21 |
| Maven | 3.9+ (inclus dans IntelliJ) |
| Node.js | 18+ |
| Angular CLI | 17+ |
| XAMPP | MySQL 8+ |

---

##  Installation & Démarrage

### 1. Base de données (XAMPP)
1. Démarrez **XAMPP** → activez **MySQL**
2. La base `project_manager_db` sera **créée automatiquement** par Spring Boot
3. Aucune configuration supplémentaire requise (root sans mot de passe par défaut)

> Si votre MySQL XAMPP a un mot de passe, modifiez `backend/src/main/resources/application.properties` :
> ```properties
> spring.datasource.password=votre_mot_de_passe
> ```

### 2. Backend Spring Boot (IntelliJ)
1. Ouvrez le dossier `backend/` dans **IntelliJ IDEA**
2. Attendez que Maven télécharge les dépendances
3. Lancez `ProjectManagerApplication.java`
4. Le serveur démarre sur **http://localhost:8080**
5. Les données de test sont insérées automatiquement au premier démarrage

### 3. Frontend Angular
```bash
cd frontend
npm install
ng serve
```
L'application est accessible sur **http://localhost:4200**

---

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@digitalsolutions.com | admin123 | ADMIN |
| alice@digitalsolutions.com | alice123 | MEMBRE |
| bob@digitalsolutions.com | bob123 | MEMBRE |

---

## 🔌 Endpoints API

### Auth (`/api/auth`)
| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| GET | `/api/auth/me` | Profil courant | ✅ |
| PUT | `/api/auth/profile` | Modifier profil | ✅ |
| GET | `/api/auth/users` | Liste utilisateurs | ✅ |

### Projets (`/api/projects`)
| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/projects` | Liste paginée (+ search, sort) | ✅ |
| GET | `/api/projects/mes-projets` | Mes projets | ✅ |
| GET | `/api/projects/{id}` | Détail projet | ✅ |
| POST | `/api/projects` | Créer projet | ✅ |
| PUT | `/api/projects/{id}` | Modifier projet | ✅ créateur/admin |
| DELETE | `/api/projects/{id}` | Supprimer projet | ✅ créateur/admin |
| POST | `/api/projects/{id}/membres/{userId}` | Ajouter membre | ✅ créateur/admin |
| DELETE | `/api/projects/{id}/membres/{userId}` | Retirer membre | ✅ créateur/admin |
| GET | `/api/projects/dashboard/stats` | Statistiques | ✅ |

### Tâches (`/api`)
| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/projects/{id}/tasks` | Tâches du projet (+ filtres) | ✅ |
| GET | `/api/tasks/mes-taches` | Mes tâches | ✅ |
| GET | `/api/tasks/{id}` | Détail tâche | ✅ |
| POST | `/api/projects/{id}/tasks` | Créer tâche | ✅ |
| PUT | `/api/tasks/{id}` | Modifier tâche | ✅ |
| PATCH | `/api/tasks/{id}/statut` | Changer statut | ✅ |
| DELETE | `/api/tasks/{id}` | Supprimer tâche | ✅ |

### Commentaires (`/api/tasks/{tacheId}/commentaires`)
| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks/{id}/commentaires` | Commentaires | ✅ |
| POST | `/api/tasks/{id}/commentaires` | Ajouter commentaire | ✅ |
| DELETE | `/api/tasks/{id}/commentaires/{cid}` | Supprimer commentaire | ✅ auteur/admin |

### WebSocket
- Endpoint STOMP : `ws://localhost:8080/ws` (via SockJS)
- Topics : `/topic/project/{id}`, `/topic/global`
- User queue : `/user/{userId}/queue/notifications`

---

##  Architecture

```
projet-examen/
├── backend/                         # Spring Boot 3.2
│   └── src/main/java/.../
│       ├── config/                  # SecurityConfig, WebSocketConfig, DataInitializer
│       ├── controller/              # AuthController, ProjectController, TaskController, CommentaireController
│       ├── dto/                     # Request/Response DTOs
│       ├── entity/                  # User, Project, Task, Commentaire, Historique
│       ├── exception/               # GlobalExceptionHandler, custom exceptions
│       ├── repository/              # JPA Repositories
│       ├── security/                # JwtUtils, JwtAuthenticationFilter, UserDetailsServiceImpl
│       ├── service/                 # AuthService, ProjectService, TaskService, CommentaireService
│       └── websocket/               # NotificationService
│
├── frontend/                        # Angular 17 (standalone components)
│   └── src/app/
│       ├── core/
│       │   ├── guards/              # authGuard, guestGuard
│       │   ├── interceptors/        # authInterceptor (JWT)
│       │   ├── models/              # TypeScript interfaces
│       │   └── services/            # AuthService, ProjectService, TaskService, ToastService, WebSocketService
│       ├── features/
│       │   ├── auth/                # Login, Register, Profile
│       │   ├── dashboard/           # Tableau de bord avec stats
│       │   ├── projects/            # List, Detail, Form
│       │   └── tasks/               # Kanban Board
│       └── shared/
│           └── components/navbar/   # Navigation
│
└── database/
    └── schema.sql                   # Documentation SQL + requêtes utiles
```

---

##  Modèle de données

```
UTILISATEURS (id, email, password, nom, prenom, role, date_inscription)
     │
     ├──< PROJETS (id, titre, description, statut, createur_id, date_creation)
     │         │
     │         ├──< TACHES (id, titre, description, statut, priorite, echeance, ordre_kanban, projet_id, assigne_a, createur_id)
     │         │        │
     │         │        └──< COMMENTAIRES (id, contenu, tache_id, auteur_id, date_creation)
     │         │
     │         ├──< HISTORIQUES (id, action, details, projet_id, user_id, date_action)
     │         │
     │         └──>< PROJET_MEMBRES (projet_id, user_id)  [N-N]
```

---

##  Variables d'environnement backend

Toutes dans `application.properties` :

```properties
app.jwt.secret=        # Clé secrète JWT (Base64, 64+ chars)
app.jwt.expiration=    # Durée validité token en ms (86400000 = 24h)
app.cors.allowed-origins=http://localhost:4200
spring.datasource.url=jdbc:mysql://localhost:3306/project_manager_db
spring.datasource.username=root
spring.datasource.password=
```

---



