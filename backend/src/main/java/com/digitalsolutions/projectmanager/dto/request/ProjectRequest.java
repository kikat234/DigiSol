package com.digitalsolutions.projectmanager.dto.request;

import com.digitalsolutions.projectmanager.entity.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne doit pas dépasser 255 caractères")
    private String titre;

    private String description;

    private Project.Statut statut;
}
