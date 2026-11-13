package com.digitalsolutions.projectmanager.dto.request;

import com.digitalsolutions.projectmanager.entity.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String description;

    private Task.Statut statut;

    private Task.Priorite priorite;

    private LocalDate echeance;

    private Long assigneAId;

    private Integer ordreKanban;
}
