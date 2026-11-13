package com.digitalsolutions.projectmanager.repository;

import com.digitalsolutions.projectmanager.entity.Historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    List<Historique> findByProjetIdOrderByDateActionDesc(Long projetId);
}
