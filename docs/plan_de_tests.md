# Plan de tests — Sécurité, Authentification et Middleware

Rôle: Tech Lead / Examinateur CDA  
Portée: Backend Node/Express + Sequelize (MySQL) — renforcement sécurité, flux change/forgot/reset password, middleware (Joi, CORS, Helmet, Winston), rate limiting, cohérence JWT.  
Objectifs: Garantir la conformité aux exigences CDA, la robustesse fonctionnelle et la sécurité des endpoints.

## 1. Stratégie globale

- Niveaux de test:
  - Unitaires: services (password, email), validators (Joi), middlewares (auth, rate limit).
  - Intégration: contrôleurs (user, auth, constructionSite, task), en simulant la couche ORM avec Jest.
  - Sécurité: tests d&#39;en-têtes HTTP (Helmet), CORS restrictif, journalisation Winston.
- Environnement:
  - Tests via Jest. Base de données: sqlite in-memory (déjà configuré pour certains tests).
  - Variables d&#39;env mockées: JWT_SECRET/JWT_EXPIRES_IN, FRONT_ORIGINS, RESET_TOKEN_TTL_MINUTES, BCRYPT_ROUNDS, NODE_ENV=test.
- Critères de succès:
  - 100% des suites test existantes + nouvelles suites pour change/forgot/reset passent.
  - Politique de mot de passe respectée, tokens de reset à usage unique avec TTL.
  - CORS restrictif et headers de sécurité effectifs en prod.
  - Rate limiting actif sur endpoints sensibles.

## 2. Cas de test — Authentification

### 2.1 Login
- Positif: POST /api/users/login avec credentials valides → 200 + JWT payload { userId, role }.
- Négatif:
  - Email ou password manquant → 400.
  - Utilisateur inconnu → 401.
  - Mot de passe incorrect → 401.
- Sécurité:
  - Rate limiting sur login (si activé): dépassement de seuil → 429.

### 2.2 Change password (protégé)
- Positif: POST /api/users/change-password
  - Avec Authorization: Bearer <JWT>, currentPassword correct, newPassword conforme à la policy → 200.
- Négatif:
  - Absence de token → 401.
  - currentPassword incorrect → 400/401 (réponse générique).
  - newPassword non conforme (longueur < 12, manque maj/min/chiffre/spécial) → 400 avec message de validation.
  - Rejouer le mot de passe identique à l&#39;ancien (si vérifié) → 400.
- Sécurité:
  - Journalisation Winston (niveau info), aucune fuite de hash, pas d&#39;infos sensibles dans la réponse.

### 2.3 Forgot password (public, rate-limité)
- Positif: POST /api/auth/forgot-password { email }:
  - Utilisateur connu → 200, réponse générique "Si un compte existe...". Email de reset "simulé" (dev) via transport JSON/console.
- Négatif:
  - Format email invalide → 400 (validator).
  - Rate limit IP/email dépassé → 429.
- Sécurité:
  - Token généré aléatoirement (32-48 octets), stocké en hash SHA-256 (jamais le token en clair).
  - TTL configuré (ex: 20 minutes).

### 2.4 Reset password (public)
- Positif: POST /api/auth/reset-password { token, newPassword, confirmPassword }
  - Token valide (non expiré, non utilisé), policy OK → 200 et invalidation du token (used_at).
- Négatif:
  - Token absent/invalide → 400/401.
  - Token expiré → 400/401.
  - Token déjà utilisé → 400/401.
  - newPassword non conforme → 400.
- Sécurité:
  - Traçabilité Winston (info), invalidation stricte du token.

## 3. Cas de test — Middlewares & Sécurité

### 3.1 Validation (Joi)
- loginSchema: email valide, password requis.
- registerSchema: blocs requis (firstname, lastname, email, numberphone, role/role_id), email unique (via controller).
- changePasswordSchema: currentPassword et newPassword conforme policy.
- forgot/reset: email/token/newPassword/confirmPassword conformes.

Tests unitaires:
- Schémas rejettent les payloads invalides (exemples pour chaque champ).
- Schémas acceptent les payloads valides.

### 3.2 Auth middleware
- protect: absence de JWT → 401; JWT invalide → 401; JWT valide → next() et req.user = {userId, role}.
- isAdmin/isManager/isWorker: rôle non autorisé → 403; rôle autorisé → next().
- checkAdminOrOwner: autorise si Admin ou si req.user.userId === req.params.id.

### 3.3 Rate limiting
- rateLimitIP: seuil par IP atteint → 429.
- rateLimitIPAndEmail: seuil combiné IP+email atteint → 429.
- Réinitialisation compteur après TTL.

### 3.4 CORS & Helmet
- CORS:
  - FRONT_ORIGINS: liste blanche d&#39;origines. Origin autorisée → succès; origin non autorisée → erreur CORS.
- Helmet (en prod):
  - CSP appliquée (default-src &#39;self&#39;, img-src &#39;self&#39; data: http://localhost:5000).
  - HSTS activé (prod), referrerPolicy no-referrer, CORP cross-origin pour besoins d&#39;images.
- Vérifier en-têtes HTTP avec supertest (si nécessaire via app instance mock).

### 3.5 Winston logging
- Logger initialisé (niveau selon env), rotation activée en prod (winston-daily-rotate-file).
- Intégration morgan → winston (stream): log HTTP au format combined.

## 4. Cas de test — Modèles & Associations

- User:
  - Doit pouvoir être créé avec rôle par défaut "Worker" (ou via role_id pour compat tests).
- Associations:
  - User ↔ Role (belongsTo/hasMany) — présent pour compat tests.
  - User ↔ Task (N-N via user_tasks).
  - User ↔ Competence (N-N via user_competences).
  
  - ConstructionSite ↔ Task (1-N).
  
  - User ↔ ConstructionSite (1-N as managedSites).
  - User ↔ PasswordResetToken (1-N).

## 5. Jeux de données et seeds (intégration)

- Roles: Admin, Worker, Manager.
- Utilisateur admin par défaut (email: admin@exemple.com) avec mot de passe fort (hashé).
- Quelques compétences, chantiers et tâches minimales (vérification du chargement ORM).

## 6. Outils et commandes

- Lancer les tests backend:
  - Windows (cmd): `cmd /c "cd backend && npm test"`
- Audit vulnérabilités:
  - `npm audit --audit-level=high` (en CI)
- Couverture:
  - Objectif: maintenir ou dépasser la couverture actuelle; seuils à raffiner en CI.

## 7. Critères d’acceptation (récapitulatif)

- Endpoints:
  - /api/users/login: validé, rate-limité, JWT {userId, role}.
  - /api/users/change-password: protégé, validé, policy respectée.
  - /api/auth/forgot-password: validé, rate-limité IP/email, réponse générique, email "mock" en dev.
  - /api/auth/reset-password: validé, consomme token (TTL/used_at), policy OK.
- Middlewares:
  - Joi en place pour payloads principaux.
  - CORS restrictif (liste blanche), Helmet durci (CSP/HSTS), Winston (JSON + rotation en prod).
  - Rate limiting appliqué sur endpoints sensibles.
- Documentation:
  - Audit et checklist à jour, plan de tests livré (ce document).

## 8. Pistes d’amélioration

- Tests E2E (via supertest) couvrant un parcours complet: register → login → change password → forgot → reset → relogin.
- Intégration d&#39;un service SMTP réel pour l&#39;envoi d&#39;emails en préprod/prod (secrets GitHub).
- Ajout SAST/DAST en CI (Snyk, OWASP ZAP) si possible.
