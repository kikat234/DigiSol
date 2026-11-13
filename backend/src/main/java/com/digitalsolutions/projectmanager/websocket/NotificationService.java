package com.digitalsolutions.projectmanager.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyProjectUpdate(Long projetId, String type, String message) {
        Map<String, Object> notification = Map.of(
                "type", type,
                "message", message,
                "projetId", projetId,
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/project/" + projetId, notification);
    }

    public void notifyUser(Long userId, String type, String message) {
        Map<String, Object> notification = Map.of(
                "type", type,
                "message", message,
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSendToUser(
                userId.toString(), "/queue/notifications", notification);
    }

    public void broadcastGlobal(String type, String message) {
        Map<String, Object> notification = Map.of(
                "type", type,
                "message", message,
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/global", notification);
    }
}
