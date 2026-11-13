package com.digitalsolutions.projectmanager.repository;

import com.digitalsolutions.projectmanager.entity.Task;
import com.digitalsolutions.projectmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjetId(Long projetId);

    List<Task> findByProjetIdAndStatut(Long projetId, Task.Statut statut);

    List<Task> findByAssigneA(User user);

    List<Task> findByAssigneAAndStatut(User user, Task.Statut statut);

    @Query("SELECT t FROM Task t WHERE t.projet.id = :projetId AND (t.assigneA = :user OR t.assigneA IS NULL)")
    List<Task> findByProjetIdAndAssigneAOrUnassigned(@Param("projetId") Long projetId, @Param("user") User user);

    long countByProjetIdAndStatut(Long projetId, Task.Statut statut);

    // Stats globales
    @Query("SELECT t.statut, COUNT(t) FROM Task t GROUP BY t.statut")
    List<Object[]> countByStatutGrouped();
}
