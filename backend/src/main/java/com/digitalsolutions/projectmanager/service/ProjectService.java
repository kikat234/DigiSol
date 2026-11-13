package com.digitalsolutions.projectmanager.service;

import com.digitalsolutions.projectmanager.dto.request.ProjectRequest;
import com.digitalsolutions.projectmanager.dto.response.ProjectResponse;
import com.digitalsolutions.projectmanager.entity.Historique;
import com.digitalsolutions.projectmanager.entity.Project;
import com.digitalsolutions.projectmanager.entity.User;
import com.digitalsolutions.projectmanager.exception.BadRequestException;
import com.digitalsolutions.projectmanager.exception.ResourceNotFoundException;
import com.digitalsolutions.projectmanager.repository.HistoriqueRepository;
import com.digitalsolutions.projectmanager.repository.ProjectRepository;
import com.digitalsolutions.projectmanager.repository.UserRepository;
import com.digitalsolutions.projectmanager.websocket.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final HistoriqueRepository historiqueRepository;
    private final NotificationService notificationService;

    public Page<ProjectResponse> getAllProjects(int page, int size, String sortBy,
                                                String direction, String search) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Project> projects;
        if (search != null && !search.isBlank()) {
            projects = projectRepository.searchByKeyword(search, pageable);
        } else {
            projects = projectRepository.findAll(pageable);
        }

        return projects.map(ProjectResponse::from);
    }

    public Page<ProjectResponse> getMyProjects(String email, int page, int size) {
        User user = getUserByEmail(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        return projectRepository.findByCreateurOrMembre(user, pageable).map(ProjectResponse::from);
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", id));
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, String email) {
        User createur = getUserByEmail(email);

        Project project = Project.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .statut(request.getStatut() != null ? request.getStatut() : Project.Statut.EN_COURS)
                .createur(createur)
                .build();

        project.getMembres().add(createur);
        Project saved = projectRepository.save(project);

        logHistorique(saved, createur, "Projet créé", "Le projet \"" + saved.getTitre() + "\" a été créé");
        notificationService.notifyProjectUpdate(saved.getId(), "PROJET_CREE", saved.getTitre());

        return ProjectResponse.from(saved);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", id));
        User user = getUserByEmail(email);

        if (!project.getCreateur().getId().equals(user.getId())
                && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Seul le créateur peut modifier ce projet");
        }

        project.setTitre(request.getTitre());
        project.setDescription(request.getDescription());
        if (request.getStatut() != null) project.setStatut(request.getStatut());

        logHistorique(project, user, "Projet modifié", "Le projet a été mis à jour");
        notificationService.notifyProjectUpdate(project.getId(), "PROJET_MODIFIE", project.getTitre());

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", id));
        User user = getUserByEmail(email);

        if (!project.getCreateur().getId().equals(user.getId())
                && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Seul le créateur peut supprimer ce projet");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse addMembre(Long projetId, Long userId, String email) {
        Project project = projectRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", projetId));
        User currentUser = getUserByEmail(email);
        User newMembre = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));

        if (!project.getCreateur().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Accès refusé");
        }

        if (project.getMembres().contains(newMembre)) {
            throw new BadRequestException("Cet utilisateur est déjà membre du projet");
        }

        project.getMembres().add(newMembre);
        logHistorique(project, currentUser, "Membre ajouté",
                newMembre.getNom() + " a été ajouté au projet");
        notificationService.notifyUser(userId, "AJOUT_PROJET",
                "Vous avez été ajouté au projet: " + project.getTitre());

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse removeMembre(Long projetId, Long userId, String email) {
        Project project = projectRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet", projetId));
        User currentUser = getUserByEmail(email);
        User membre = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));

        if (!project.getCreateur().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Accès refusé");
        }

        project.getMembres().remove(membre);
        logHistorique(project, currentUser, "Membre retiré",
                membre.getNom() + " a été retiré du projet");

        return ProjectResponse.from(projectRepository.save(project));
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjets", projectRepository.count());
        stats.put("projetsEnCours", projectRepository.countByStatut(Project.Statut.EN_COURS));
        stats.put("projetsTermines", projectRepository.countByStatut(Project.Statut.TERMINE));
        stats.put("totalUtilisateurs", userRepository.count());
        return stats;
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
