# Documentation API — Digital Solutions Project Manager

## Base URL
```
http://localhost:8080/api
```

## Authentification
Toutes les requêtes (sauf `/auth/register` et `/auth/login`) nécessitent un header :
```
Authorization: Bearer <jwt_token>
```

---

## Exemples de requêtes (curl)

### Inscription
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Doe","prenom":"John","email":"john@test.com","password":"secret123"}'
```

### Connexion
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitalsolutions.com","password":"admin123"}'
```

### Créer un projet
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Mon Projet","description":"Description...","statut":"EN_COURS"}'
```

### Lister projets avec recherche
```bash
curl "http://localhost:8080/api/projects?search=web&page=0&size=10&sortBy=dateCreation&direction=desc" \
  -H "Authorization: Bearer <token>"
```

### Créer une tâche
```bash
curl -X POST http://localhost:8080/api/projects/1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Nouvelle tâche","statut":"A_FAIRE","priorite":"HAUTE","assigneAId":2}'
```

### Changer statut d'une tâche (drag & drop)
```bash
curl -X PATCH http://localhost:8080/api/tasks/1/statut \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"statut":"EN_COURS"}'
```

### Ajouter un commentaire
```bash
curl -X POST http://localhost:8080/api/tasks/1/commentaires \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contenu":"Voici mon commentaire"}'
```

---

## Format des réponses d'erreur

```json
{
  "status": 400,
  "message": "Cet email est déjà utilisé",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Erreurs de validation (400)
```json
{
  "status": 400,
  "message": "Erreur de validation",
  "errors": {
    "email": "Format d'email invalide",
    "password": "Le mot de passe doit contenir au moins 6 caractères"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Codes HTTP utilisés
| Code | Signification |
|---|---|
| 200 | OK |
| 201 | Créé |
| 204 | Supprimé (no content) |
| 400 | Requête invalide / validation |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 500 | Erreur interne |

---

## Format réponse paginée (projets)

```json
{
  "content": [...],
  "totalElements": 15,
  "totalPages": 2,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```
