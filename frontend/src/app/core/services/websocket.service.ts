import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../models/models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private notification$ = new Subject<Notification>();
  notifications$ = this.notification$.asObservable();

  constructor(private authService: AuthService) {}

  connect() {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      onConnect: () => {
        console.log('WebSocket connecté');
        // Abonnement aux notifications globales
        this.client!.subscribe('/topic/global', (msg: IMessage) => {
          this.notification$.next(JSON.parse(msg.body));
        });
        // Abonnement aux notifications personnelles
        const userId = this.authService.currentUser()?.id;
        if (userId) {
          this.client!.subscribe(`/user/${userId}/queue/notifications`, (msg: IMessage) => {
            this.notification$.next(JSON.parse(msg.body));
          });
        }
      },
      onDisconnect: () => console.log('WebSocket déconnecté'),
      onStompError: (frame) => console.error('STOMP error', frame),
      reconnectDelay: 5000
    });

    this.client.activate();
  }

  subscribeToProject(projetId: number, callback: (n: Notification) => void) {
    if (!this.client?.connected) return () => {};
    const sub = this.client.subscribe(`/topic/project/${projetId}`, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
    return () => sub.unsubscribe();
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
