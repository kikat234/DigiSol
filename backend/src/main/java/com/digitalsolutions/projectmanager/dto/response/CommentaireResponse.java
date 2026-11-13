package com.digitalsolutions.projectmanager.dto.response;

import com.digitalsolutions.projectmanager.entity.Commentaire;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommentaireResponse {
    private Long id;
    private String contenu;
    private UserResponse auteur;
    private Long tacheId;
    private LocalDateTime dateCreation;

    public static CommentaireResponse from(Commentaire c) {
        return CommentaireResponse.builder()
                .id(c.getId())
                .contenu(c.getContenu())
                .auteur(UserResponse.from(c.getAuteur()))
                .tacheId(c.getTache().getId())
                .dateCreation(c.getDateCreation())
                .build();
    }
}
