# DevOps — CI/CD, Sécurité opérationnelle et Exécution

Rôle: Tech Lead / Examinateur CDA  
Portée: Backend Node/Express + Sequelize — pipeline GitHub Actions, sécurité runtime (CORS/Helmet/Logs), variables d&#39;environnement, bonnes pratiques.

## 1) CI/CD — GitHub Actions

Fichier: .github/workflows/ci.yml (présent)

Pipelines:
- Jobs:
  - backend:
    - OS: ubuntu-latest
    - Node: matrice 18.x et 20.x
    - Étapes:
      - checkout + setup-node (cache npm)
      - installation: npm ci dans backend/
      - tests: npm test (Jest, couverture)
      - audit: npm audit --audit-level=high
      - artefacts: rapport coverage (upload)
  - frontend (optionnel si activé):
    - installation: npm ci dans frontend/edifis-pro/
    - build: npm run build
    - tests (si présents): npm test

Cache:
- actions/setup-node@v4 avec cache: npm + cache-dependency-path pointant vers backend/package-lock.json et frontend/edifis-pro/package-lock.json.

Secrets (optionnels):
- SNYK_TOKEN (si scan Snyk ajouté)
- SMTP_* (si tests d&#39;envoi email en CI)
- DATABASE_URL, etc. (si tests d’intégration DB réels — non requis ici, on reste en sqlite mémoire pour tests).

Artifacts:
- coverage-backend/ (rapport Jest)

Politique d’exécution:
- Sur push et pull_request dans branches principales (main, develop).

## 2) Sécurité runtime (serveur)

Helmet (backend/server.js):
- CSP stricte: default-src &#39;self&#39;, img-src &#39;self&#39; data: http://localhost:5000 (ajustable)
- CORP: cross-origin (pour images des uploads)
- referrerPolicy: no-referrer
- HSTS: activé seulement en production

CORS (backend/server.js):
- Liste blanche via FRONT_ORIGINS (CORS_ORIGINS ou FRONTEND_URL)
- Méthodes: GET/POST/PUT/DELETE/PATCH/OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true
- Clients non navigateur (origin null) autorisés

Logging:
- Winston (backend/config/logger.js) + DailyRotateFile en production
- Morgan (format combined) connecté à Winston via stream
- Logs application (niveau selon LOG_LEVEL)

Rate Limiting:
- rate-limiter-flexible, middlewares:
  - rateLimitIP()
  - rateLimitIPAndEmail()
- À appliquer sur endpoints sensibles: /api/users/login, /api/auth/forgot-password, etc.

Validation d’entrée:
- Joi (backend/middlewares/validator.middleware.js) — schémas:
  - login, register, changePassword, forgotPassword, resetPassword
- Application par route (routes/*.js) avant contrôleurs

Gestion des erreurs:
- Réponses génériques pour auth (pas de fuite d&#39;infos)
- Journalisation côté serveur (Winston niveau warn/error)
- Contrôle des stack traces selon NODE_ENV

## 3) Authentification & Sécurité métier

JWT:
- Payload homogène: { userId, role }
- Middleware protect: vérifie Bearer token et peuple req.user
- Gardiens de rôle: isAdmin/isManager/isWorker, checkAdminOrOwner
- Aucune fuite de JWT/secret dans les logs

Mots de passe:
- bcrypt (configurable via BCRYPT_ROUNDS)
- Service centralisé: backend/services/password.service.js (hash/compare/policy)
- Politique (par défaut): min 12, au moins 1 maj, 1 min, 1 chiffre, 1 spécial (paramétrable)

Parcours mots de passe:
- Change Password: POST /api/users/change-password (protégé)
  - Validation Joi, comparaison ancien mdp, policy sur le nouveau, rotation du hash
- Forgot Password: POST /api/auth/forgot-password (public, rate-limité)
  - Génère un token fort, stocke uniquement le hash (SHA-256), TTL (RESET_TOKEN_TTL_MINUTES), envoi mail (dev: transport JSON)
- Reset Password: POST /api/auth/reset-password (public)
  - Valide token (hash + TTL + non utilisé), applique policy + hash, invalide le token (used_at)
- Modèle associé: backend/models/PasswordResetToken.js
  - user_id, token_hash, expires_at, used_at, ip, user_agent

## 4) Variables d’environnement (exemple .env)

- NODE_ENV=development
- PORT=5000
- JWT_SECRET=change-me
- JWT_EXPIRES_IN=1d
- FRONTEND_URL=http://localhost:5173
- CORS_ORIGINS=http://localhost:5173
- BCRYPT_ROUNDS=10
- RESET_TOKEN_TTL_MINUTES=20
- SMTP_HOST=smtp.example.com
- SMTP_PORT=587
- SMTP_USER=user
- SMTP_PASS=pass
- DEFAULT_PASSWORD=edifispr@2025
- LOG_LEVEL=info

Remarques:
- En production, activer HSTS (via NODE_ENV=production) et s’assurer d’être derrière HTTPS.
- Ne pas logger de secrets (pas de console.log de JWT_SECRET ou équivalents).

## 5) Exécution locale (développement)

Prérequis:
- Node.js LTS (18/20)
- MySQL local (si utilisation de MySQL), sinon tests utilisent sqlite mémoire

Backend:
- Installation: cd backend && npm ci
- Lancement (dev): npm run dev
- Tests: npm test

Frontend:
- Installation: cd frontend/edifis-pro && npm ci
- Lancement: npm run dev

Docker (optionnel):
- docker-compose up -d (vérifier docker-compose.yml pour services DB + backend + frontend)
- Variables d’environnement injectées via .env

## 6) Bonnes pratiques & conformité

- Principe du moindre privilège (rôles Admin/Manager/Worker)
- Validation stricte des payloads (Joi): rejeter par défaut ce qui n’est pas attendu
- CORS restrictive: aucune valeur wildcard en prod
- CSP: éviter les inline scripts; si nécessaire, utiliser des nonces/hashes
- Journaux:
  - Pas de données sensibles (hashs, tokens, secrets)
  - Rotation et rétention en prod
- Migrations DB (si nécessaires) alignées avec le MPD
- Couverture de tests: surveiller le seuil (à fixer dans la CI)

## 7) Maintenance & évolutions

- Ajouter des tests unitaires pour les nouveaux services (email, password, rate limit)
- Étendre la pipeline avec SAST/DAST (Snyk/ZAP)
- Exporter des métriques (Prometheus) et health-checks si déploiement long-lived
- Centraliser les erreurs HTTP via un error handler standard et un format JSON d’erreur (code, message, details)
