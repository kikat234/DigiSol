package com.digitalsolutions.projectmanager.repository;

import com.digitalsolutions.projectmanager.entity.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    List<Commentaire> findByTacheIdOrderByDateCreationAsc(Long tacheId);
}
