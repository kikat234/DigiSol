import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { WebSocketService } from './core/services/websocket.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar>
    <main [class.with-navbar]="authService.currentUser()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main.with-navbar {
      margin-top: 64px;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public authService: AuthService,
    private wsService: WebSocketService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.wsService.connect();
      this.wsService.notifications$.subscribe(n => {
        this.toast.info(n.message);
      });
    }
  }

  ngOnDestroy() {
    this.wsService.disconnect();
  }
}
