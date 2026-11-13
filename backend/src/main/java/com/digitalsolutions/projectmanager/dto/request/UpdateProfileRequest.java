package com.digitalsolutions.projectmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String prenom;

    private String currentPassword;

    private String newPassword;
}
