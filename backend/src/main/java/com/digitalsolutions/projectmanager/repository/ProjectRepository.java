package com.digitalsolutions.projectmanager.repository;

import com.digitalsolutions.projectmanager.entity.Project;
import com.digitalsolutions.projectmanager.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findAll(Pageable pageable);

    // Projets d'un créateur
    Page<Project> findByCreateur(User createur, Pageable pageable);

    // Recherche par titre (Niveau 2)
    @Query("SELECT p FROM Project p WHERE LOWER(p.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Project> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Projets où l'utilisateur est membre OU créateur
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.membres m WHERE p.createur = :user OR m = :user")
    Page<Project> findByCreateurOrMembre(@Param("user") User user, Pageable pageable);

    // Stats pour le tableau de bord
    long countByCreateur(User createur);
    long countByStatut(Project.Statut statut);
}
