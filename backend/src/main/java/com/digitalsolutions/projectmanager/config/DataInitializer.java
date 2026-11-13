package com.digitalsolutions.projectmanager.config;

import com.digitalsolutions.projectmanager.entity.Project;
import com.digitalsolutions.projectmanager.entity.Task;
import com.digitalsolutions.projectmanager.entity.User;
import com.digitalsolutions.projectmanager.repository.ProjectRepository;
import com.digitalsolutions.projectmanager.repository.TaskRepository;
import com.digitalsolutions.projectmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Données déjà initialisées.");
            return;
        }

        log.info("Initialisation des données de test...");

        // Créer admin
        User admin = userRepository.save(User.builder()
                .nom("Admin")
                .prenom("Super")
                .email("admin@digitalsolutions.com")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .build());

        // Créer membres
        User alice = userRepository.save(User.builder()
                .nom("Dupont")
                .prenom("Alice")
                .email("alice@digitalsolutions.com")
                .password(passwordEncoder.encode("alice123"))
                .role(User.Role.MEMBRE)
                .build());

        User bob = userRepository.save(User.builder()
                .nom("Martin")
                .prenom("Bob")
                .email("bob@digitalsolutions.com")
                .password(passwordEncoder.encode("bob123"))
                .role(User.Role.MEMBRE)
                .build());

        // Créer projets
        Project p1 = new Project();
        p1.setTitre("Refonte Site Web");
        p1.setDescription("Refonte complète du site web de l'entreprise avec nouveau design responsive");
        p1.setStatut(Project.Statut.EN_COURS);
        p1.setCreateur(admin);
        p1.getMembres().add(admin);
        p1.getMembres().add(alice);
        p1.getMembres().add(bob);
        projectRepository.save(p1);

        Project p2 = new Project();
        p2.setTitre("Application Mobile");
        p2.setDescription("Développement d'une application mobile iOS/Android");
        p2.setStatut(Project.Statut.EN_COURS);
        p2.setCreateur(alice);
        p2.getMembres().add(alice);
        p2.getMembres().add(bob);
        projectRepository.save(p2);

        Project p3 = new Project();
        p3.setTitre("Migration Base de Données");
        p3.setDescription("Migration de MySQL vers PostgreSQL pour améliorer les performances");
        p3.setStatut(Project.Statut.TERMINE);
        p3.setCreateur(admin);
        p3.getMembres().add(admin);
        p3.getMembres().add(bob);
        projectRepository.save(p3);

        // Créer tâches projet 1
        taskRepository.save(Task.builder()
                .titre("Maquettes UI/UX").description("Créer les maquettes Figma")
                .statut(Task.Statut.TERMINE).priorite(Task.Priorite.HAUTE)
                .projet(p1).createur(admin).assigneA(alice)
                .echeance(LocalDate.now().minusDays(5)).ordreKanban(0).build());

        taskRepository.save(Task.builder()
                .titre("Intégration HTML/CSS").description("Intégrer les maquettes en HTML/CSS")
                .statut(Task.Statut.EN_COURS).priorite(Task.Priorite.HAUTE)
                .projet(p1).createur(admin).assigneA(alice)
                .echeance(LocalDate.now().plusDays(7)).ordreKanban(0).build());

        taskRepository.save(Task.builder()
                .titre("API Backend").description("Développer les endpoints REST")
                .statut(Task.Statut.EN_COURS).priorite(Task.Priorite.URGENTE)
                .projet(p1).createur(admin).assigneA(bob)
                .echeance(LocalDate.now().plusDays(10)).ordreKanban(1).build());

        taskRepository.save(Task.builder()
                .titre("Tests unitaires").description("Écrire les tests unitaires")
                .statut(Task.Statut.A_FAIRE).priorite(Task.Priorite.NORMALE)
                .projet(p1).createur(admin).assigneA(bob)
                .echeance(LocalDate.now().plusDays(14)).ordreKanban(0).build());

        // Tâches projet 2
        taskRepository.save(Task.builder()
                .titre("Setup React Native").description("Initialiser le projet React Native")
                .statut(Task.Statut.TERMINE).priorite(Task.Priorite.HAUTE)
                .projet(p2).createur(alice).assigneA(alice)
                .echeance(LocalDate.now().minusDays(3)).ordreKanban(0).build());

        taskRepository.save(Task.builder()
                .titre("Écran d'authentification").description("Créer les écrans login/register")
                .statut(Task.Statut.EN_COURS).priorite(Task.Priorite.HAUTE)
                .projet(p2).createur(alice).assigneA(bob)
                .echeance(LocalDate.now().plusDays(5)).ordreKanban(0).build());

        log.info("✅ Données de test initialisées avec succès !");
        log.info("Comptes de test :");
        log.info("  admin@digitalsolutions.com / admin123 (ADMIN)");
        log.info("  alice@digitalsolutions.com / alice123 (MEMBRE)");
        log.info("  bob@digitalsolutions.com / bob123 (MEMBRE)");
    }
}
