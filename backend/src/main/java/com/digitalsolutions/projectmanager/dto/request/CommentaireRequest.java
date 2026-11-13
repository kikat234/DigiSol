package com.digitalsolutions.projectmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentaireRequest {
    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    private String contenu;
}
