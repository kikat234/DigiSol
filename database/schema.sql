-- =============================================================
-- Script SQL - Digital Solutions Project Manager
-- Base de données : project_manager_db
-- Compatible MySQL (XAMPP)
-- =============================================================

CREATE DATABASE IF NOT EXISTS project_manager_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE project_manager_db;

-- Les tables sont créées automatiquement par Hibernate (ddl-auto=update)
-- Ce script fournit des données de test supplémentaires si nécessaire.

-- Vérification de la structure après démarrage Spring Boot :
-- SHOW TABLES;
-- DESCRIBE utilisateurs;
-- DESCRIBE projets;
-- DESCRIBE taches;
-- DESCRIBE commentaires;
-- DESCRIBE historiques;
-- DESCRIBE projet_membres;

-- ---------------------------------------------------------------
-- Données de test (insérées automatiquement par DataInitializer)
-- ---------------------------------------------------------------
-- Comptes disponibles après le premier démarrage :
--
-- ADMIN  : admin@digitalsolutions.com  / admin123
--
-- Projets créés :
--   1. "Refonte Site Web"       (EN_COURS)  - créateur: Admin
-- ---------------------------------------------------------------

-- Requêtes utiles pour vérifier les données :
SELECT u.id, u.nom, u.prenom, u.email, u.role FROM utilisateurs u;
SELECT p.id, p.titre, p.statut, u.nom as createur FROM projets p JOIN utilisateurs u ON p.createur_id = u.id;
SELECT t.id, t.titre, t.statut, t.priorite, u.nom as assigne FROM taches t LEFT JOIN utilisateurs u ON t.assigne_a = u.id;
SELECT pm.projet_id, pm.user_id FROM projet_membres pm;
