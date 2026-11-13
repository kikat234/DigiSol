package com.digitalsolutions.projectmanager.dto.response;

import com.digitalsolutions.projectmanager.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String titre;
    private String description;
    private Project.Statut statut;
    private UserResponse createur;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private List<UserResponse> membres;
    private long totalTaches;
    private long tachesTerminees;
    private long tachesEnCours;
    private long tachesAFaire;

    public static ProjectResponse from(Project project) {
        long total = project.getTaches().size();
        long terminees = project.getTaches().stream()
                .filter(t -> t.getStatut() == com.digitalsolutions.projectmanager.entity.Task.Statut.TERMINE)
                .count();
        long enCours = project.getTaches().stream()
                .filter(t -> t.getStatut() == com.digitalsolutions.projectmanager.entity.Task.Statut.EN_COURS)
                .count();
        long aFaire = project.getTaches().stream()
                .filter(t -> t.getStatut() == com.digitalsolutions.projectmanager.entity.Task.Statut.A_FAIRE)
                .count();

        return ProjectResponse.builder()
                .id(project.getId())
                .titre(project.getTitre())
                .description(project.getDescription())
                .statut(project.getStatut())
                .createur(UserResponse.from(project.getCreateur()))
                .dateCreation(project.getDateCreation())
                .dateMiseAJour(project.getDateMiseAJour())
                .membres(project.getMembres().stream().map(UserResponse::from).toList())
                .totalTaches(total)
                .tachesTerminees(terminees)
                .tachesEnCours(enCours)
                .tachesAFaire(aFaire)
                .build();
    }
}
