package com.digitalsolutions.projectmanager.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "utilisateurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nom;

    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBRE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dateInscription;

    @UpdateTimestamp
    private LocalDateTime dateMiseAJour;

    // Projets créés par cet utilisateur
    @OneToMany(mappedBy = "createur", cascade = CascadeType.ALL)
    private Set<Project> projetsCreés = new HashSet<>();

    // Tâches assignées à cet utilisateur
    @OneToMany(mappedBy = "assigneA")
    private Set<Task> tachesAssignees = new HashSet<>();

    // Membres des projets (relation N-N)
    @ManyToMany(mappedBy = "membres")
    private Set<Project> projetsParticipants = new HashSet<>();

    public enum Role {
        ADMIN, MEMBRE
    }
}
