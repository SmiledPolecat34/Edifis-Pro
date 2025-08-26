Cahier des Charges – Edifis Pro (v1.1 révisé)
1. Contexte du Projet
1.1 Présentation Générale

Edifis Pro est une application web de gestion de chantiers destinée au secteur du BTP.
Elle centralise la gestion des chantiers, des utilisateurs (rôles, compétences), des tâches et le suivi de leur avancement.

1.2 Problématique

Les entreprises du BTP rencontrent :

Des difficultés à coordonner plusieurs chantiers simultanément

Un manque de visibilité sur les compétences disponibles par ouvrier

Une perte de temps dans la répartition et le suivi des tâches

Une communication fragmentée entre managers et équipes

1.3 Solution Proposée

Développer une plateforme web centralisée offrant :

La gestion unifiée des utilisateurs et de leurs compétences

Le suivi en temps réel des chantiers et des tâches associées

Une allocation optimisée des ressources humaines

Un système simple de réinitialisation de mot de passe

⚠️ Changement par rapport à la version précédente :



2. Périmètre du Projet
2.1 Périmètre Fonctionnel

Inclus :

Gestion des utilisateurs avec trois rôles (Admin, Manager, Worker)

Gestion des chantiers (CRUD complet + image)

Gestion des tâches (CRUD, multi-affectation)

Gestion des compétences (référentiel + association aux ouvriers)

Authentification sécurisée (JWT)

Réinitialisation de mot de passe

Exclus (v1) :

Gestion financière et facturation

Module de paie

Feuilles de temps détaillées (reporté v1.2)

Application mobile native

Intégration avec des ERP tiers

2.2 Périmètre Technique

Backend : Node.js (Express.js)

Base de données : MySQL 8 (Sequelize ORM)

Frontend : React + TypeScript + Vite

Authentification : JWT

Conteneurisation : Docker

3. Acteurs du Système

Admin : gestion des utilisateurs, supervision globale

Manager : création et gestion de ses chantiers, affectation d’ouvriers, suivi d’avancement

Worker : consultation de ses tâches, mise à jour de l’avancement, gestion de ses compétences

Visiteur : accès à la page de connexion, demande de reset password

4. Exigences Fonctionnelles
4.1 Utilisateurs

EF-01 : Création de compte utilisateur avec validation

EF-02 : Authentification sécurisée (email/mot de passe)

EF-03 : Gestion des rôles (Admin, Manager, Worker)

EF-04 : Modification profil

EF-05 : Upload photo profil

EF-06 : Réinitialisation de mot de passe par email

4.2 Chantiers

EF-07 : Création chantier avec informations complètes

EF-08 : Modification / suppression chantier

EF-09 : Affectation d’un chef de projet

EF-10 : Suivi état chantier (Prévu, En cours, Terminé, Annulé)

EF-11 : Upload d’image

4.3 Tâches

EF-12 : Création de tâches liées à un chantier

EF-13 : Multi-affectation ouvriers

EF-14 : Suivi du statut des tâches

EF-15 : Définition dates de début/fin

4.4 Compétences

EF-16 : Création du référentiel de compétences

EF-17 : Association compétences/ouvriers

EF-18 : Recherche par compétence

5. Exigences Non Fonctionnelles

Performance : API p95 < 500 ms, pages < 3s, 100 users simultanés

Sécurité : Auth JWT, mots de passe hashés (bcrypt/Argon2), CORS whitelist, Helmet, validation Joi/Zod, rate limiting

Disponibilité : 99% hors maintenance, sauvegardes quotidiennes

Utilisabilité : Responsive (mobile/tablette/desktop), accessibilité WCAG 2.1 AA, support navigateurs récents

6. Contraintes

Techniques : Node.js LTS, MySQL 8+, Docker, Git

Organisationnelles : méthode Agile (sprints 2 semaines), doc vivante, couverture tests > 70%, revues de code

Réglementaires : RGPD (données persos), archivage légal (5 ans)

7. Critères d’Acceptation

User stories priorité haute validées

Couverture tests > 70%

Swagger/OpenAPI documenté

Audit sécurité basique validé (OWASP)

Déploiement Docker fonctionnel

8. Planning Prévisionnel (v1)

Phase 1 (4 semaines) : Architecture + Auth + Users

Phase 2 (6 semaines) : Chantiers + Tâches + Compétences

Phase 3 (2 semaines) : Export CSV + Dashboard simple

Phase 4 (2 semaines) : Tests, doc, déploiement

9. Risques Identifiés
Risque	Probabilité	Impact	Mitigation
Retard livraison	Moyenne	Élevé	Priorisation stricte
Failles de sécurité	Moyenne	Élevé	Audits réguliers
Manque d’adoption outil	Moyenne	Moyen	Formation utilisateurs
10. Budget Estimatif

Développement : 320 h

Tests et recette : 60 h

Documentation : 30 h

DevOps & déploiement : 40 h

Total : 450 h

📌 Document validé le : [Date]
📌 Version : 1.1
📌 Auteur : Équipe Edifis Pro