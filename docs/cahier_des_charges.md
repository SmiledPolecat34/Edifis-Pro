# Cahier des Charges - Edifis Pro

## 1. Contexte du Projet

### 1.1 Présentation Générale
Edifis Pro est une application web de gestion de chantiers destinée au secteur du BTP. Elle permet de gérer les ressources humaines, les compétences, les tâches et le suivi temporel des projets de construction.

### 1.2 Problématique
Les entreprises du BTP font face à des défis majeurs :
- Difficulté de coordination des équipes sur plusieurs chantiers
- Manque de visibilité sur les compétences disponibles
- Suivi chronophage des heures travaillées
- Communication inefficace entre chefs de projet et ouvriers

### 1.3 Solution Proposée
Une plateforme web centralisée permettant :
- La gestion unifiée des chantiers et des équipes
- Le suivi en temps réel de l'avancement des projets
- L'optimisation de l'allocation des ressources
- La digitalisation des feuilles de temps

## 2. Périmètre du Projet

### 2.1 Périmètre Fonctionnel

**Inclus :**
- Gestion des utilisateurs avec trois rôles (Admin, Manager, Worker)
- Gestion des chantiers (CRUD complet)
- Gestion des tâches et leur affectation
- Gestion des compétences des ouvriers
- Système de feuilles de temps (timesheets)
- Authentification sécurisée avec JWT
- Réinitialisation de mot de passe

**Exclus :**
- Gestion financière et facturation
- Module de paie
- Application mobile native
- Intégration avec des ERP tiers

### 2.2 Périmètre Technique

**Technologies retenues :**
- Backend : Node.js avec Express.js
- Base de données : MySQL avec Sequelize ORM
- Frontend : React avec TypeScript et Vite
- Authentification : JWT (JSON Web Tokens)
- Conteneurisation : Docker

## 3. Acteurs du Système

### 3.1 Administrateur (Admin)
- **Rôle** : Gestion globale de la plateforme
- **Responsabilités** :
  - Créer et gérer tous les utilisateurs
  - Superviser l'ensemble des chantiers
  - Configurer les paramètres système
  - Accéder à toutes les fonctionnalités

### 3.2 Chef de Projet (Manager)
- **Rôle** : Gestion opérationnelle des chantiers
- **Responsabilités** :
  - Créer et gérer ses chantiers
  - Affecter des ouvriers aux tâches
  - Valider les feuilles de temps
  - Suivre l'avancement des projets

### 3.3 Ouvrier (Worker)
- **Rôle** : Exécution des tâches sur chantier
- **Responsabilités** :
  - Consulter ses affectations
  - Remplir ses feuilles de temps
  - Mettre à jour ses compétences
  - Signaler l'avancement des tâches

### 3.4 Visiteur
- **Rôle** : Utilisateur non authentifié
- **Responsabilités** :
  - Accéder à la page de connexion
  - Demander une réinitialisation de mot de passe

## 4. Exigences Fonctionnelles

### 4.1 Gestion des Utilisateurs
| ID | Exigence | Priorité |
|----|----------|----------|
| EF-01 | Création de compte utilisateur avec validation des données | Haute |
| EF-02 | Authentification sécurisée par email/mot de passe | Haute |
| EF-03 | Gestion des rôles (Admin, Manager, Worker) | Haute |
| EF-04 | Modification du profil utilisateur | Moyenne |
| EF-05 | Upload de photo de profil | Basse |
| EF-06 | Réinitialisation de mot de passe par email | Haute |

### 4.2 Gestion des Chantiers
| ID | Exigence | Priorité |
|----|----------|----------|
| EF-07 | Création de chantier avec informations complètes | Haute |
| EF-08 | Modification et suppression de chantier | Haute |
| EF-09 | Affectation d'un chef de projet | Haute |
| EF-10 | Suivi de l'état du chantier (Prévu, En cours, Terminé, Annulé) | Haute |
| EF-11 | Upload d'image pour le chantier | Moyenne |

### 4.3 Gestion des Tâches
| ID | Exigence | Priorité |
|----|----------|----------|
| EF-12 | Création de tâches liées à un chantier | Haute |
| EF-13 | Affectation d'ouvriers aux tâches | Haute |
| EF-14 | Suivi du statut des tâches | Haute |
| EF-15 | Définition des dates de début/fin | Moyenne |

### 4.4 Gestion des Compétences
| ID | Exigence | Priorité |
|----|----------|----------|
| EF-16 | Création et gestion du référentiel de compétences | Moyenne |
| EF-17 | Association compétences/ouvriers | Moyenne |
| EF-18 | Recherche d'ouvriers par compétence | Basse |

### 4.5 Gestion des Feuilles de Temps
| ID | Exigence | Priorité |
|----|----------|----------|
| EF-19 | Saisie des heures travaillées par chantier | Haute |
| EF-20 | Validation des feuilles de temps par le manager | Haute |
| EF-21 | Export des données de temps | Moyenne |

## 5. Exigences Non Fonctionnelles

### 5.1 Performance
| ID | Exigence | Critère |
|----|----------|---------|
| ENF-01 | Temps de réponse des API | < 500ms pour 95% des requêtes |
| ENF-02 | Temps de chargement des pages | < 3 secondes |
| ENF-03 | Capacité de charge | 100 utilisateurs simultanés |

### 5.2 Sécurité
| ID | Exigence | Critère |
|----|----------|---------|
| ENF-04 | Authentification JWT sécurisée | Token avec expiration 24h |
| ENF-05 | Politique de mot de passe forte | Min 12 caractères, complexité OWASP |
| ENF-06 | Protection CORS | Liste blanche des origines |
| ENF-07 | Headers de sécurité | Helmet.js avec CSP strict |
| ENF-08 | Rate limiting | Protection anti brute-force |
| ENF-09 | Validation des entrées | Joi sur tous les endpoints |

### 5.3 Disponibilité
| ID | Exigence | Critère |
|----|----------|---------|
| ENF-10 | Disponibilité du service | 99% (hors maintenance) |
| ENF-11 | Sauvegarde des données | Quotidienne avec rétention 30j |

### 5.4 Utilisabilité
| ID | Exigence | Critère |
|----|----------|---------|
| ENF-12 | Interface responsive | Compatible mobile/tablette/desktop |
| ENF-13 | Accessibilité | Niveau AA WCAG 2.1 |
| ENF-14 | Support navigateurs | Chrome, Firefox, Safari, Edge |

## 6. Contraintes

### 6.1 Contraintes Techniques
- Utilisation obligatoire de Node.js LTS (v18 ou v20)
- Base de données MySQL 8.0+
- Déploiement via Docker
- Code versionné sur Git

### 6.2 Contraintes Organisationnelles
- Respect de la méthodologie Agile
- Documentation technique à jour
- Tests unitaires avec couverture > 70%
- Revue de code obligatoire

### 6.3 Contraintes Réglementaires
- Conformité RGPD pour les données personnelles
- Respect du droit du travail pour les feuilles de temps
- Archivage légal des données (5 ans)

## 7. Critères d'Acceptation

### 7.1 Critères Fonctionnels
- [ ] Toutes les user stories priorité "Haute" implémentées
- [ ] Tests d'acceptation validés par le client
- [ ] Parcours utilisateurs fluides et sans erreur

### 7.2 Critères Techniques
- [ ] Couverture de tests > 70%
- [ ] Audit de sécurité OWASP passé
- [ ] Performance conforme aux exigences
- [ ] Documentation technique complète

### 7.3 Critères de Livraison
- [ ] Code source avec historique Git
- [ ] Documentation utilisateur
- [ ] Guide de déploiement
- [ ] Environnement de test fonctionnel

## 8. Planning Prévisionnel

### Phase 1 : Fondations (4 semaines)
- Architecture technique
- Modèle de données
- Authentification/Autorisation
- CRUD utilisateurs

### Phase 2 : Cœur Métier (6 semaines)
- Gestion des chantiers
- Gestion des tâches
- Système de compétences
- Interface utilisateur de base

### Phase 3 : Fonctionnalités Avancées (4 semaines)
- Feuilles de temps
- Tableaux de bord
- Exports de données
- Optimisations

### Phase 4 : Finalisation (2 semaines)
- Tests complets
- Corrections de bugs
- Documentation
- Déploiement

## 9. Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Retard de livraison | Moyenne | Élevé | Priorisation stricte des fonctionnalités |
| Problèmes de performance | Faible | Moyen | Tests de charge réguliers |
| Failles de sécurité | Moyenne | Élevé | Audits de sécurité fréquents |
| Résistance au changement | Moyenne | Moyen | Formation des utilisateurs |

## 10. Budget Estimatif

- Développement : 400 heures
- Tests et recette : 80 heures
- Documentation : 40 heures
- Formation : 20 heures
- **Total : 540 heures**

---

*Document validé le : [Date]*  
*Version : 1.0*  
*Auteur : Équipe Edifis Pro*
