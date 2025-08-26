# TODO — Sécurisation Backend, Auth avancée, MERISE/UML, CI/CD

Ce plan d&#39;exécution détaille les étapes à réaliser suite à la validation du plan. Les cases seront cochées au fur et à mesure de l&#39;avancement.

## Phase 1 — Audit & Documentation initiale
- [ ] Créer `docs/audit.md` (état actuel, forces/faiblesses, risques, priorités)
- [ ] Créer `CHECKLIST.md` (Gap analysis CDA: OK / Partiel / Manquant)
- [ ] Lecture ciblée du code backend (routes, contrôleurs, middlewares, modèles, config)
- [ ] État de référence des tests: exécution et synthèse des résultats

## Phase 2 — Middlewares & Durcissement serveur
- [ ] Ajouter `backend/middlewares/validator.middleware.js` (Joi) + schémas initiaux
- [ ] Intégrer Winston (logs applicatifs, format JSON, transports console/fichier)
- [ ] Intégrer morgan <-> Winston (stream HTTP)
- [ ] Durcir CORS (liste blanche via env FRONTEND_URL ; pas de `*` en prod)
- [ ] Durcir Helmet (CSP, HSTS en prod, noSniff, referrerPolicy, etc.)
- [ ] Middleware global de gestion d&#39;erreurs

## Phase 3 — Change Password (sécurisation)
- [ ] Définir la politique de mot de passe (min 12, 1 maj, 1 min, 1 chiffre, 1 spécial)
- [ ] Centraliser le hash (service password) — conserver `bcrypt` (ajouter option argon2 si requis)
- [ ] Renforcer `POST /api/users/change-password`:
  - [ ] Validation de payload (validator.middleware)
  - [ ] Vérif ancien mot de passe, application de la policy, rotation du hash
  - [ ] Logs Winston, réponses génériques (pas de fuite d&#39;infos)
- [ ] Tests (succès, ancien mdp erroné, policy non respectée, JWT manquant/invalide)

## Phase 4 — Forgot/Reset Password
- [ ] Créer modèle Sequelize `PasswordResetToken` (user_id, token_hash, expires_at, used_at, ip, user_agent)
- [ ] Endpoint `POST /api/auth/forgot-password`:
  - [ ] Rate limiting (par IP et par email)
  - [ ] Génération token fort (32–48 bytes), stockage en hash SHA-256
  - [ ] TTL (par défaut 20 min), envoi email (Nodemailer; mock/dev console)
  - [ ] Réponse générique
- [ ] Endpoint `POST /api/auth/reset-password`:
  - [ ] Vérification hash + TTL + usage
  - [ ] Application de la policy + hash
  - [ ] Invalidation du token (used_at)
- [ ] Tests (génération, TTL expiré, déjà utilisé, reset OK, erreurs)

## Phase 5 — MERISE
- [ ] Produire MCD → MLD → MPD à partir des modèles existants (+ PasswordResetToken)
- [ ] Générer `docs/merise.mmd` (Mermaid) et `docs/merise.puml` (PlantUML)
- [ ] Générer `db/schema.sql` (DDL) aligné avec MPD
- [ ] Générer `db/seed.sql` (jeu de données minimal)

## Phase 6 — UML
- [ ] Use case global + cas d&#39;utilisation Reset Password (Mermaid + PlantUML)
- [ ] Diagramme de classes multicouche (Controllers, Services, Repositories, Models, DTO/Validators)
- [ ] Séquences: login, change password, forgot/reset password, CRUD principal
- [ ] Fichiers: `docs/uml-*.mmd` et `docs/uml-*.puml`

## Phase 7 — CI/CD (GitHub Actions)
- [ ] Créer `.github/workflows/ci.yml`
  - [ ] Job tests (backend puis frontend): `npm ci`, lint, build, test
  - [ ] Job sécurité: `npm audit --audit-level=high` (option Snyk si secret dispo)
  - [ ] Cache npm, matrice Node LTS (18/20), artifacts coverage

## Phase 8 — Patches & Documentation
- [ ] Générer `patches/*.diff` pour modifications clés (auth, middlewares, sécurité)
- [ ] Rédiger `docs/plan_de_tests.md` (unitaires, intégration, sécu)
- [ ] Rédiger `docs/devops.md` (CI/CD, variables d&#39;env, déploiement)

## Dépendances (backend) à prévoir
- Validation: `joi`
- Logs: `winston`, `winston-daily-rotate-file`
- Sécurité rate-limit: `rate-limiter-flexible`
- Email: `nodemailer`
- Option hash: `argon2` (si exigé, sinon `bcrypt` conservé)
- Nettoyage: `mongoose` (à retirer si réellement non utilisé)

## Variables d&#39;environnement (exemples)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `FRONTEND_URL` (ex: `http://localhost:5173`)
- `NODE_ENV=development|production`
- `SMTP_*` (si SMTP réel)
- `RATE_LIMIT_*` (si granularité configurée)

## Traçabilité
- Toutes les décisions de sécurité et leurs justifications documentées dans `docs/audit.md`.
- Compléments MERISE/UML/SQL livrés dans `docs/` et `db/`.
