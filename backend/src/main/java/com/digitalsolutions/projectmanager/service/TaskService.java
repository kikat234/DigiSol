package com.digitalsolutions.projectmanager.service;

import com.digitalsolutions.projectmanager.dto.request.TaskRequest;
import com.digitalsolutions.projectmanager.dto.response.TaskResponse;
import com.digitalsolutions.projectmanager.entity.*;
import com.digitalsolutions.projectmanager.exception.ResourceNotFoundException;
import com.digitalsolutions.projectmanager.repository.*;
import com.digitalsolutions.projectmanager.websocket.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final HistoriqueRepository historiqueRepository;
    private final NotificationService notificationService;

    public List<TaskResponse> getTasksByProject(Long projetId, String statut, Long assigneAId) {
        List<Task> tasks;

        if (statut != null && !statut.isBlank()) {
            tasks = taskRepository.findByProjetIdAndStatut(projetId,
                    Task.Statut.valueOf(statut.toUpperCase()));
        } else {
            tasks = taskRepository.findByProjetId(projetId);
        }

        if (assigneAId != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getAssigneA() != null
                            && t.getAssigneA().getId().equals(assigneAId))
                    .toList();
        }

        return tasks.stream().map(TaskResponse::from).toList();
    }

    public List<TaskResponse> getMyTasks(String email) {
        User user = getUserByEmail(email);
        return taskRepository.findByAssigneA(user).stream()
                .map(TaskResponse::from).toList();
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse createTask(Long projetId, TaskRequest request, String email) {
        Project project = projectRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", projetId));
        User createur = getUserByEmail(email);

        Task task = Task.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .statut(request.getStatut() != null ? request.getStatut() : Task.Statut.A_FAIRE)
                .priorite(request.getPriorite() != null ? request.getPriorite() : Task.Priorite.NORMALE)
                .echeance(request.getEcheance())
                .ordreKanban(request.getOrdreKanban() != null ? request.getOrdreKanban() : 0)
                .projet(project)
                .createur(createur)
                .build();

        if (request.getAssigneAId() != null) {
            User assigne = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            task.setAssigneA(assigne);
            notificationService.notifyUser(assigne.getId(), "TACHE_ASSIGNEE",
                    "Vous avez une nouvelle tâche: " + task.getTitre());
        }

        Task saved = taskRepository.save(task);
        logHistorique(project, createur, "Tâche créée",
                "Tâche \"" + saved.getTitre() + "\" créée dans le projet");
        notificationService.notifyProjectUpdate(projetId, "TACHE_CREEE", saved.getTitre());

        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, String email) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));
        User user = getUserByEmail(email);

        Task.Statut ancienStatut = task.getStatut();

        task.setTitre(request.getTitre());
        task.setDescription(request.getDescription());
        if (request.getStatut() != null) task.setStatut(request.getStatut());
        if (request.getPriorite() != null) task.setPriorite(request.getPriorite());
        if (request.getEcheance() != null) task.setEcheance(request.getEcheance());
        if (request.getOrdreKanban() != null) task.setOrdreKanban(request.getOrdreKanban());

        if (request.getAssigneAId() != null) {
            User assigne = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            task.setAssigneA(assigne);
        } else if (request.getAssigneAId() == null && request.getTitre() != null) {
            // keep existing assignment
        }

        Task saved = taskRepository.save(task);

        if (ancienStatut != saved.getStatut()) {
            logHistorique(task.getProjet(), user, "Statut modifié",
                    "Tâche \"" + saved.getTitre() + "\": " + ancienStatut + " → " + saved.getStatut());
            notificationService.notifyProjectUpdate(task.getProjet().getId(),
                    "STATUT_CHANGE", saved.getTitre() + " → " + saved.getStatut());
        }

        return TaskResponse.from(saved);
    }

    @Transactional
    public TaskResponse updateStatut(Long id, String statut, String email) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));
        User user = getUserByEmail(email);
        Task.Statut ancienStatut = task.getStatut();
        task.setStatut(Task.Statut.valueOf(statut.toUpperCase()));
        Task saved = taskRepository.save(task);

        logHistorique(task.getProjet(), user, "Statut modifié",
                "Tâche \"" + saved.getTitre() + "\": " + ancienStatut + " → " + saved.getStatut());
        notificationService.notifyProjectUpdate(task.getProjet().getId(),
                "STATUT_CHANGE", saved.getTitre() + " → " + saved.getStatut());

        return TaskResponse.from(saved);
    }

    @Transactional
    public void deleteTask(Long id, String email) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));
        User user = getUserByEmail(email);

        boolean isCreateur = task.getProjet().getCreateur().getId().equals(user.getId());
        boolean isAssigne = task.getAssigneA() != null
                && task.getAssigneA().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isCreateur && !isAssigne && !isAdmin) {
            throw new AccessDeniedException("Vous ne pouvez pas supprimer cette tâche");
        }

        taskRepository.delete(task);
    }

    private void logHistorique(Project project, User user, String action, String details) {
        Historique h = Historique.builder()
                .projet(project)
                .utilisateur(user)
                .action(action)
                .details(details)
                .build();
        historiqueRepository.save(h);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }
}
