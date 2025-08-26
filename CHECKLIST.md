# CHECKLIST — Conformité CDA et livrables

Statuts: OK / Partiel / Manquant

## 1. Authentification / Sécurité
- [X] Politique de mot de passe (min 12, 1 maj, 1 min, 1 chiffre, 1 spécial) — Statut: Manquant
- [ ] Changement de mot de passe sécurisé (vérif ancien mdp, policy, hash centralisé) — Statut: Partiel
- [ ] Oubli / Reset mot de passe (token TTL, invalidation, email, rate limit) — Statut: Manquant
- [ ] Hash sécurisé (bcrypt en place; option argon2) — Statut: Partiel
- [ ] JWT cohérent (claims unifiés, durée, stockage côté client sécurisé) — Statut: Partiel
- [ ] Rôles / Autorisations cohérentes (Admin/Manager/Worker) — Statut: Partiel
- [ ] Pas de fuite d’infos sensibles dans les logs (env, secrets) — Statut: Manquant

## 2. Middlewares & Durcissement
- [ ] Validation des payloads (Joi/Zod) — Statut: Manquant
- [ ] CORS restrictif (whitelist via FRONTEND_URL, pas de "*") — Statut: Manquant
- [ ] Helmet renforcé (CSP stricte, HSTS prod, nosniff, referrerPolicy) — Statut: Partiel
- [ ] Logging production (Winston, rotation, morgan→winston) — Statut: Manquant
- [ ] Rate limiting (anti brute-force/flooding) — Statut: Manquant
- [ ] Middleware global de gestion d’erreurs — Statut: Manquant

## 3. Qualité / Tests
- [ ] Tests unitaires change-password — Statut: Manquant
- [ ] Tests intégration forgot/reset — Statut: Manquant
- [ ] Couverture minimale (seuil à définir) — Statut: Manquant
- [ ] Nettoyage du code (duplications, incohérences claims role vs role_id) — Statut: Partiel

## 4. Conception & Base de données
- [ ] MERISE: MCD → MLD → MPD — Statut: Manquant
- [ ] Diagrammes MERISE: Mermaid (.mmd) et PlantUML (.puml) — Statut: Manquant
- [ ] SQL DDL (db/schema.sql) — Statut: Manquant
- [ ] Données seed (db/seed.sql) — Statut: Manquant

## 5. UML
- [ ] Use case global — Statut: Manquant
- [ ] Use case reset password — Statut: Manquant
- [ ] Diagramme de classes multicouche — Statut: Manquant
- [ ] Diagrammes de séquence (login, change, forgot/reset, CRUD) — Statut: Manquant
- [ ] Export Mermaid & PlantUML — Statut: Manquant

## 6. CI/CD
- [ ] Pipeline GitHub Actions (tests backend+frontend) — Statut: Manquant
- [ ] Scan vulnérabilités (npm audit, option Snyk) — Statut: Manquant
- [ ] Cache npm, matrice Node 18/20 — Statut: Manquant
- [ ] Artifacts coverage (rapport tests) — Statut: Manquant

## 7. Patches & Documentation
- [ ] docs/audit.md — Statut: OK
- [ ] docs/plan_de_tests.md — Statut: Manquant
- [ ] docs/devops.md — Statut: Manquant
- [ ] patches/*.diff (modifs clés) — Statut: Manquant

---

## Prochaines étapes validées
1) Middlewares & durcissement serveur:
   - validator.middleware.js (Joi)
   - Winston + morgan (stream), error handler
   - CORS restrictif, Helmet CSP/HSTS
2) Auth avancée:
   - Change password (policy + tests)
   - Forgot/reset (modèle token, endpoints, rate limit, email + tests)
3) Conception & DevOps:
   - MERISE + UML + SQL
   - CI/CD GitHub Actions
