# Audit technique — Edifis-Pro (Backend Node/Express + Sequelize)

Rôle: Tech Lead / Examinateur CDA (Bac+3)  
Périmètre: Sécurité applicative, AuthN/AuthZ, qualité code/tests, middleware, CI/CD, conception (MERISE/UML), base de données.

## 1) Contexte et objectifs

- Objectif général: renforcer la sécurité et la robustesse du backend (Node/Express + Sequelize), implémenter les parcours de changement/oubli de mot de passe, ajouter des middleware de validation, durcir CORS/Helmet, introduire un logging de production (Winston), produire les artefacts MERISE/UML/SQL et mettre en place une pipeline CI/CD GitHub Actions.
- Frontend: React + Vite (frontend/edifis-pro).
- Conteneurs: Dockerfile + docker-compose.yml.

## 2) Cartographie technique (aperçu)

- Serveur: `backend/server.js`
  - Express, CORS, Helmet, Morgan activés.
  - CORS actuellement permissif (origin: "*").
  - CSP minimaliste injectée dynamiquement.
- Authentification/Autorisations:
  - JWT: `jsonwebtoken`.
  - Middleware: `backend/middlewares/auth.middleware.js` (protect/isAdmin/isWorker/isManager/checkAdminOrOwner).
  - Contrôleur utilisateur: `backend/controllers/user.controller.js` (login, createUser, updateUser, deleteUser, changePassword, getAllUsers, etc.).
- Modèles Sequelize (MySQL): `backend/models/`
  - User, Role, Task, Timesheet, ConstructionSite, Competence (+ associations via includes).
- Journalisation:
  - `morgan("dev")` côté serveur; pas de Winston.
- Validation:
  - Aucune validation schéma centralisée (Joi/Zod non présents).
- Rate limiting:
  - Absent.
- Emailing (reset password):
  - Absent (pas de Nodemailer).
- Tests:
  - Présents (Jest) notamment sur modèles/contrôleurs (fichiers TS dans `backend/tests/...`).
- Dépendances (extrait `backend/package.json`):
  - bcrypt, cors, dotenv, express, helmet, jsonwebtoken, morgan, multer, mysql2, sequelize.
  - Dev: jest, supertest, ts-jest, sqlite3 (pour tests).
  - Note: présence de `mongoose` semble non utilisée côté Sequelize.

## 3) État actuel — Sécurité & Auth

- CORS:
  - Configuré avec `origin: "*"`, méthodes GET/POST/PUT/DELETE autorisées, headers Content-Type/Authorization. Ouverture totale non conforme aux bonnes pratiques prod.
- Helmet:
  - Appel `helmet()` par défaut; CSP ajoutée via `res.setHeader("Content-Security-Policy", "...")` pour chaque requête; HSTS non conditionné à la prod.
- Morgan:
  - Activé en mode `dev`. Pas de pipeline de logs vers un logger applicatif (Winston).
- JWT:
  - Génération lors du login; claims: soit `{ userId, role_id }` soit `{ userId, role }` selon les sections du contrôleur (incohérence relevée).
  - Middleware `protect` injecte `req.user = decoded`.
  - Middlewares d’autorisations comparent `req.user.role` à des chaînes `"Admin"`, `"Worker"`, `"Manager"`.
- Mots de passe:
  - Hash via bcrypt (facteur coût 10).
  - Politique minimale: longueur >= 8 dans changePassword; pas de politique OWASP renforcée.
  - Pas de flux “mot de passe oublié / reset” (token TTL, invalidation, email).
- Validation d’entrée:
  - Absente (pas de Joi/Zod).
- Rate limiting / anti-abus:
  - Absent.
- Traces sensibles:
  - `console.log(process.env.JWT_SECRET)` et `console.log(process.env.JWT_EXPIRES_IN)` en fin de `user.controller.js` — fuite potentielle d’informations sensibles.

## 4) Qualité du code — observations

- `backend/controllers/user.controller.js`:
  - Fonctions dupliquées (login, updateUser, deleteUser apparaissent en double) — dette technique et risque d’incohérence.
  - Incohérence `role` vs `role_id` dans JWT.
  - Hash de mot de passe à plusieurs endroits (création, update, change-password) — à centraliser.
- `backend/middlewares/auth.middleware.js`:
  - `checkAdminOrOwner` utilise `req.user.id` alors que les tokens portent `userId`. Incohérence potentielle.
- Cohérence des rôles:
  - Middlewares comparent des valeurs textuelles (`"Admin"`, `"Manager"`, `"Worker"`); s’assurer que la base et les JWT utilisent la même convention (string vs id).
- Mongoose:
  - Présent dans `package.json` alors que le projet est basé sur Sequelize/MySQL. À nettoyer si inutile.

## 5) Forces / Faiblesses

- Forces:
  - Architecture MVC claire (routes, controllers, models).
  - Tests présents (models, controllers).
  - Auth JWT existante, bcrypt intégré.
  - Helmet + Morgan déjà en place.
- Faiblesses:
  - CORS trop permissif.
  - Absence de validation d’entrée (Joi/Zod).
  - Pas de Winston ni de stratégie de logs prod.
  - Pas de rate limiting.
  - Politique de mot de passe minimale.
  - Absence complète du parcours “mot de passe oublié / reset”.
  - Incohérences de code (duplication, claims JWT, id vs userId).
  - Fuites de variables d’environnement dans les logs.

## 6) Gap analysis (référentiel CDA) — synthèse

- Auth & Sécurité:
  - Change password sécurisé: Partiel (policy faible, non centralisée).
  - Forgot/Reset password (TTL, invalidation, email, rate limit): Manquant.
  - Validation d’entrée (Joi/Zod): Manquant.
  - CORS restrictif: Manquant (actuellement “*”).
  - Helmet renforcé (CSP stricte, HSTS prod, noSniff, referrerPolicy): Partiel/Manquant.
  - Logging production (Winston, rotation, corrélation): Manquant.
  - Rate limiting (anti brute-force / flooding): Manquant.
- Qualité/Tests:
  - Tests unitaires/intégration pour change/forgot/reset: Manquant.
  - Cohérence code (suppression duplications, centralisation hash): Partiel.
- Conception/Docs:
  - MERISE (MCD/MLD/MPD) + DDL + seed: Manquant.
  - UML (use cases, classes, séquences): Manquant.
  - Documentation devops/pipeline: Manquant.
- CI/CD:
  - Pipeline GitHub Actions (tests + scan vulnérabilités): Manquant.

## 7) Risques priorisés

1. CORS ouvert en production — risque XSS, CSRF inter-origines.
2. Absence de validation — risque d’injections et d’erreurs 500.
3. Parcours reset password inexistant — dette produit et sécurité.
4. Pas de rate limiting — risque brute-force et abus.
5. Logs sensibles — fuite credentials/env.
6. Incohérences JWT/roles — autorisations incorrectes.

## 8) Plan d’action validé (résumé)

- Middlewares & durcissement:
  - Ajouter validator.middleware (Joi), Durcir CORS (whitelist via FRONTEND_URL), Helmet (CSP stricte + HSTS prod), Winston (JSON + rotation), middleware d’erreurs, morgan→winston stream.
- Auth:
  - Change password: policy OWASP-like (min 12, maj/min/chiffre/spécial), centraliser hash, tests.
  - Forgot/reset password: modèle PasswordResetToken (hash token, TTL, used_at), endpoints, rate limit, mailing (Nodemailer dev), tests.
- Conception:
  - MERISE (MCD/MLD/MPD) → Mermaid + PlantUML, DDL schema.sql + seed.sql.
- UML:
  - Use cases (global + reset), classes multicouche, séquences (login/change/forgot/reset/CRUD).
- CI/CD:
  - GitHub Actions: tests backend+frontend, audit vulnérabilités, cache npm, matrice Node 18/20.

## 9) Paramètres par défaut (jusqu’à contre-indication)

- Politique mot de passe: min=12, 1 maj, 1 min, 1 chiffre, 1 spécial.
- TTL reset token: 20 minutes.
- CORS whitelist: `FRONTEND_URL=http://localhost:5173` (ajustable).
- Hash: conserver bcrypt (existants), option argon2 possible si requis.
- Email: Nodemailer avec transport “console/log” en dev; SMTP configurable.

## 10) Traçabilité des sources examinées

- backend/server.js
- backend/middlewares/auth.middleware.js
- backend/controllers/user.controller.js
- backend/routes/user.routes.js (à compléter lors de l’implémentation)
- backend/models/User.js (+ autres modèles via includes)
- backend/package.json

## 11) Étapes suivantes

1) Créer CHECKLIST.md (gap CDA OK/Partiel/Manquant) et compléter au fil de l’eau.  
2) Mettre en place les middlewares (validator, Winston, CORS/Helmet), corriger incohérences JWT/roles et supprimer logs sensibles.  
3) Implémenter change password renforcé + tests.  
4) Implémenter forgot/reset password (modèle + endpoints + rate limit + email) + tests.  
5) Produire MERISE/UML + SQL.  
6) Ajouter pipeline CI/CD GitHub Actions.
