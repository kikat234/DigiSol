package com.digitalsolutions.projectmanager.dto.response;

import com.digitalsolutions.projectmanager.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String titre;
    private String description;
    private Task.Statut statut;
    private Task.Priorite priorite;
    private LocalDate echeance;
    private Integer ordreKanban;
    private Long projetId;
    private String projetTitre;
    private UserResponse assigneA;
    private UserResponse createur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private int nombreCommentaires;

    public static TaskResponse from(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .titre(task.getTitre())
                .description(task.getDescription())
                .statut(task.getStatut())
                .priorite(task.getPriorite())
                .echeance(task.getEcheance())
                .ordreKanban(task.getOrdreKanban())
                .projetId(task.getProjet().getId())
                .projetTitre(task.getProjet().getTitre())
                .assigneA(task.getAssigneA() != null ? UserResponse.from(task.getAssigneA()) : null)
                .createur(task.getCreateur() != null ? UserResponse.from(task.getCreateur()) : null)
                .dateCreation(task.getDateCreation())
                .dateMiseAJour(task.getDateMiseAJour())
                .nombreCommentaires(task.getCommentaires().size())
                .build();
    }
}
