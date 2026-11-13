package com.digitalsolutions.projectmanager.controller;

import com.digitalsolutions.projectmanager.dto.request.CommentaireRequest;
import com.digitalsolutions.projectmanager.dto.response.CommentaireResponse;
import com.digitalsolutions.projectmanager.service.CommentaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{tacheId}/commentaires")
@RequiredArgsConstructor
public class CommentaireController {

    private final CommentaireService commentaireService;

    @GetMapping
    public ResponseEntity<List<CommentaireResponse>> getCommentaires(@PathVariable Long tacheId) {
        return ResponseEntity.ok(commentaireService.getCommentairesByTask(tacheId));
    }

    @PostMapping
    public ResponseEntity<CommentaireResponse> addCommentaire(
            @PathVariable Long tacheId,
            @Valid @RequestBody CommentaireRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentaireService.addCommentaire(
                        tacheId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommentaire(
            @PathVariable Long tacheId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        commentaireService.deleteCommentaire(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
