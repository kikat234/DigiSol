import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component')
          .then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./features/projects/project-form/project-form.component')
          .then(m => m.ProjectFormComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component')
          .then(m => m.ProjectDetailComponent)
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () => import('./features/projects/project-form/project-form.component')
          .then(m => m.ProjectFormComponent)
      },
      {
        path: 'projects/:id/board',
        loadComponent: () => import('./features/tasks/task-board/task-board.component')
          .then(m => m.TaskBoardComponent)
      },
      {
        path: 'my-tasks',
        loadComponent: () => import('./features/tasks/task-board/task-board.component')
          .then(m => m.TaskBoardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/profile/profile.component')
          .then(m => m.ProfileComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
