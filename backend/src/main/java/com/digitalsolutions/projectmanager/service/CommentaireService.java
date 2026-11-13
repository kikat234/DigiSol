package com.digitalsolutions.projectmanager.service;

import com.digitalsolutions.projectmanager.dto.request.CommentaireRequest;
import com.digitalsolutions.projectmanager.dto.response.CommentaireResponse;
import com.digitalsolutions.projectmanager.entity.Commentaire;
import com.digitalsolutions.projectmanager.entity.Task;
import com.digitalsolutions.projectmanager.entity.User;
import com.digitalsolutions.projectmanager.exception.ResourceNotFoundException;
import com.digitalsolutions.projectmanager.repository.CommentaireRepository;
import com.digitalsolutions.projectmanager.repository.TaskRepository;
import com.digitalsolutions.projectmanager.repository.UserRepository;
import com.digitalsolutions.projectmanager.websocket.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<CommentaireResponse> getCommentairesByTask(Long tacheId) {
        return commentaireRepository.findByTacheIdOrderByDateCreationAsc(tacheId)
                .stream().map(CommentaireResponse::from).toList();
    }

    @Transactional
    public CommentaireResponse addCommentaire(Long tacheId, CommentaireRequest request, String email) {
        Task task = taskRepository.findById(tacheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", tacheId));
        User auteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Commentaire commentaire = Commentaire.builder()
                .contenu(request.getContenu())
                .tache(task)
                .auteur(auteur)
                .build();

        Commentaire saved = commentaireRepository.save(commentaire);

        // Notifier l'assigné si différent de l'auteur
        if (task.getAssigneA() != null
                && !task.getAssigneA().getId().equals(auteur.getId())) {
            notificationService.notifyUser(
                    task.getAssigneA().getId(),
                    "NOUVEAU_COMMENTAIRE",
                    auteur.getNom() + " a commenté la tâche: " + task.getTitre()
            );
        }

        notificationService.notifyProjectUpdate(
                task.getProjet().getId(),
                "COMMENTAIRE_AJOUTE",
                "Commentaire sur: " + task.getTitre()
        );

        return CommentaireResponse.from(saved);
    }

    @Transactional
    public void deleteCommentaire(Long id, String email) {
        Commentaire commentaire = commentaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire", id));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!commentaire.getAuteur().getId().equals(user.getId())
                && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Vous ne pouvez pas supprimer ce commentaire");
        }

        commentaireRepository.delete(commentaire);
    }
}
