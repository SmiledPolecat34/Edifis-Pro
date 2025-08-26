# Plan de Tests Complet - Edifis Pro

## 1. Introduction

### 1.1 Objectifs
Ce plan de tests vise à garantir la qualité, la fiabilité et la sécurité de l'application Edifis Pro. Il couvre l'ensemble des fonctionnalités critiques et s'assure de la conformité aux exigences du cahier des charges.

### 1.2 Périmètre
- Tests unitaires des composants backend
- Tests d'intégration des API
- Tests End-to-End (E2E) des parcours utilisateurs
- Tests de sécurité selon OWASP Top 10

### 1.3 Stratégie de Tests
- **Approche** : Bottom-up (des composants vers le système complet)
- **Automatisation** : Jest pour les tests unitaires/intégration, Cypress pour E2E
- **Couverture cible** : 80% minimum
- **Environnements** : Local, Test, Staging

## 2. Tests Unitaires

### 2.1 Services Backend

#### 2.1.1 Service de Mot de Passe
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-PWD-01 | Hash d'un mot de passe valide | "MonMotDePasse123!" | Hash bcrypt valide |
| TU-PWD-02 | Comparaison mot de passe correct | "MonMotDePasse123!", hash | true |
| TU-PWD-03 | Comparaison mot de passe incorrect | "AutreMotDePasse", hash | false |
| TU-PWD-04 | Validation politique - conforme | "MonMotDePasse123!" | true |
| TU-PWD-05 | Validation politique - trop court | "Court1!" | false + message erreur |
| TU-PWD-06 | Validation politique - sans majuscule | "monmotdepasse123!" | false + message erreur |
| TU-PWD-07 | Validation politique - sans chiffre | "MonMotDePasseSansChiffre!" | false + message erreur |
| TU-PWD-08 | Validation politique - sans caractère spécial | "MonMotDePasse123" | false + message erreur |

#### 2.1.2 Service Email
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-EMAIL-01 | Envoi email reset password | email, token | Email envoyé (mock) |
| TU-EMAIL-02 | Template email correct | données template | HTML valide |
| TU-EMAIL-03 | Gestion erreur SMTP | config invalide | Exception gérée |

### 2.2 Middlewares

#### 2.2.1 Middleware d'Authentification
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-AUTH-01 | Token JWT valide | Bearer token valide | req.user défini, next() |
| TU-AUTH-02 | Token JWT expiré | Bearer token expiré | 401 Unauthorized |
| TU-AUTH-03 | Token JWT invalide | Bearer token malformé | 401 Unauthorized |
| TU-AUTH-04 | Absence de token | Aucun header | 401 Unauthorized |
| TU-AUTH-05 | Vérification rôle Admin | req.user.role = "Admin" | next() |
| TU-AUTH-06 | Vérification rôle insuffisant | req.user.role = "Worker" | 403 Forbidden |

#### 2.2.2 Middleware de Validation
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-VAL-01 | Données conformes au schéma | JSON valide | next() |
| TU-VAL-02 | Champ requis manquant | JSON incomplet | 400 Bad Request |
| TU-VAL-03 | Type de données incorrect | string au lieu de number | 400 Bad Request |
| TU-VAL-04 | Format email invalide | "notanemail" | 400 Bad Request |

#### 2.2.3 Rate Limiting
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-RATE-01 | Requêtes sous la limite | 5 requêtes/minute | 200 OK |
| TU-RATE-02 | Dépassement limite IP | 11 requêtes/minute | 429 Too Many Requests |
| TU-RATE-03 | Reset après TTL | Attente 1 minute | Compteur réinitialisé |

### 2.3 Modèles Sequelize

#### 2.3.1 Modèle User
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-USER-01 | Création utilisateur valide | Données complètes | Instance créée |
| TU-USER-02 | Email unique | Email existant | Erreur unicité |
| TU-USER-03 | Associations correctes | - | Relations définies |
| TU-USER-04 | Validation des champs | Données invalides | Erreur validation |

## 3. Tests d'Intégration

### 3.1 API Authentification

#### 3.1.1 Login
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-LOGIN-01 | Connexion réussie | POST | /api/users/login | {email, password} valides | 200 + JWT |
| TI-LOGIN-02 | Email incorrect | POST | /api/users/login | email inexistant | 401 Unauthorized |
| TI-LOGIN-03 | Mot de passe incorrect | POST | /api/users/login | password erroné | 401 Unauthorized |
| TI-LOGIN-04 | Données manquantes | POST | /api/users/login | {} | 400 Bad Request |
| TI-LOGIN-05 | Rate limit dépassé | POST | /api/users/login | 11 tentatives | 429 Too Many Requests |

#### 3.1.2 Change Password
| Test ID | Description | Méthode | Endpoint | Headers | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|---------|------------------|
| TI-CHPWD-01 | Changement réussi | POST | /api/users/change-password | JWT valide | {currentPassword, newPassword} | 200 OK |
| TI-CHPWD-02 | Ancien mdp incorrect | POST | /api/users/change-password | JWT valide | currentPassword erroné | 400 Bad Request |
| TI-CHPWD-03 | Nouveau mdp non conforme | POST | /api/users/change-password | JWT valide | newPassword faible | 400 + détails |
| TI-CHPWD-04 | Sans authentification | POST | /api/users/change-password | - | payload valide | 401 Unauthorized |

#### 3.1.3 Forgot Password
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-FORGOT-01 | Email existant | POST | /api/auth/forgot-password | {email: valide} | 200 + message générique |
| TI-FORGOT-02 | Email inexistant | POST | /api/auth/forgot-password | {email: inconnu} | 200 + message générique |
| TI-FORGOT-03 | Format email invalide | POST | /api/auth/forgot-password | {email: "invalid"} | 400 Bad Request |
| TI-FORGOT-04 | Rate limit | POST | /api/auth/forgot-password | 6 requêtes rapides | 429 Too Many Requests |

#### 3.1.4 Reset Password
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-RESET-01 | Token valide | POST | /api/auth/reset-password | {token, newPassword} | 200 OK |
| TI-RESET-02 | Token expiré | POST | /api/auth/reset-password | token > 20min | 400 Token expiré |
| TI-RESET-03 | Token déjà utilisé | POST | /api/auth/reset-password | token used | 400 Token invalide |
| TI-RESET-04 | Token inexistant | POST | /api/auth/reset-password | token random | 400 Token invalide |
| TI-RESET-05 | Mot de passe non conforme | POST | /api/auth/reset-password | password faible | 400 + détails |

### 3.2 API CRUD

#### 3.2.1 Gestion des Utilisateurs
| Test ID | Description | Méthode | Endpoint | Rôle Requis | Résultat Attendu |
|---------|-------------|---------|----------|-------------|------------------|
| TI-USER-01 | Liste des utilisateurs | GET | /api/users | Admin | 200 + liste |
| TI-USER-02 | Détail utilisateur | GET | /api/users/:id | Admin/Owner | 200 + détails |
| TI-USER-03 | Création utilisateur | POST | /api/users | Admin | 201 Created |
| TI-USER-04 | Modification utilisateur | PUT | /api/users/:id | Admin/Owner | 200 OK |
| TI-USER-05 | Suppression utilisateur | DELETE | /api/users/:id | Admin | 204 No Content |
| TI-USER-06 | Accès non autorisé | GET | /api/users | Worker | 403 Forbidden |

#### 3.2.2 Gestion des Chantiers
| Test ID | Description | Méthode | Endpoint | Rôle Requis | Résultat Attendu |
|---------|-------------|---------|----------|-------------|------------------|
| TI-SITE-01 | Liste des chantiers | GET | /api/construction-sites | Tous | 200 + liste |
| TI-SITE-02 | Création chantier | POST | /api/construction-sites | Admin/Manager | 201 Created |
| TI-SITE-03 | Modification chantier | PUT | /api/construction-sites/:id | Admin/Manager | 200 OK |
| TI-SITE-04 | Upload image chantier | POST | /api/construction-sites/:id/image | Admin/Manager | 200 OK |
| TI-SITE-05 | Suppression chantier | DELETE | /api/construction-sites/:id | Admin | 204 No Content |

## 4. Tests End-to-End (E2E)

### 4.1 Parcours Authentification
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-AUTH-01 | Connexion complète | 1. Page login<br>2. Saisie credentials<br>3. Submit<br>4. Redirection | Dashboard affiché |
| TE2E-AUTH-02 | Déconnexion | 1. Click logout<br>2. Confirmation | Retour page login |
| TE2E-AUTH-03 | Session expirée | 1. Attendre expiration<br>2. Action protégée | Redirection login |

### 4.2 Parcours Reset Password
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-RESET-01 | Reset complet | 1. Click "Mot de passe oublié"<br>2. Saisir email<br>3. Recevoir email<br>4. Click lien<br>5. Nouveau mdp<br>6. Connexion | Connexion réussie |
| TE2E-RESET-02 | Token expiré | 1-4. Idem<br>5. Attendre 21min<br>6. Utiliser lien | Message erreur |

### 4.3 Parcours Métier
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-SITE-01 | Création chantier | 1. Menu chantiers<br>2. Bouton créer<br>3. Remplir formulaire<br>4. Valider | Chantier créé et visible |
| TE2E-TASK-01 | Affectation tâche | 1. Sélectionner chantier<br>2. Créer tâche<br>3. Affecter ouvrier<br>4. Sauvegarder | Tâche affectée |


## 5. Tests de Sécurité

### 5.1 Tests OWASP Top 10
| Test ID | Vulnérabilité | Test | Résultat Attendu |
|---------|---------------|------|------------------|
| TS-OWASP-01 | Injection SQL | Payload SQL dans les champs | Requête rejetée |
| TS-OWASP-02 | XSS | Script dans les inputs | Script échappé |
| TS-OWASP-03 | CSRF | Requête cross-origin | Token CSRF requis |
| TS-OWASP-04 | Broken Auth | Tentatives brute force | Rate limit actif |
| TS-OWASP-05 | Sensitive Data | Inspection réponses API | Pas de données sensibles |
| TS-OWASP-06 | XXE | Upload XML malicieux | Parsing sécurisé |
| TS-OWASP-07 | Access Control | Accès ressources autres users | 403 Forbidden |
| TS-OWASP-08 | Security Headers | Scan headers HTTP | CSP, HSTS, etc. présents |

### 5.2 Tests de Pénétration
| Test ID | Type d'Attaque | Méthode | Résultat Attendu |
|---------|----------------|---------|------------------|
| TS-PEN-01 | Brute Force Login | 1000 tentatives/min | Blocage après 10 |
| TS-PEN-02 | Token Manipulation | JWT modifié | Signature invalide |
| TS-PEN-03 | Path Traversal | ../../../etc/passwd | Accès refJe vais procéder à la création du fichier `plan_de_tests.md` avec le contenu complet, car l'édition a échoué en raison de problèmes de correspondance. Voici le contenu que je vais utiliser :

<create_file>
<path>docs/plan_de_tests.md</path>
<content>
# Plan de Tests Complet - Edifis Pro

## 1. Introduction

### 1.1 Objectifs
Ce plan de tests vise à garantir la qualité, la fiabilité et la sécurité de l'application Edifis Pro. Il couvre l'ensemble des fonctionnalités critiques et s'assure de la conformité aux exigences du cahier des charges.

### 1.2 Périmètre
- Tests unitaires des composants backend
- Tests d'intégration des API
- Tests End-to-End (E2E) des parcours utilisateurs
- Tests de sécurité selon OWASP Top 10

### 1.3 Stratégie de Tests
- **Approche** : Bottom-up (des composants vers le système complet)
- **Automatisation** : Jest pour les tests unitaires/intégration, Cypress pour E2E
- **Couverture cible** : 80% minimum
- **Environnements** : Local, Test, Staging

## 2. Tests Unitaires

### 2.1 Services Backend

#### 2.1.1 Service de Mot de Passe
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-PWD-01 | Hash d'un mot de passe valide | "MonMotDePasse123!" | Hash bcrypt valide |
| TU-PWD-02 | Comparaison mot de passe correct | "MonMotDePasse123!", hash | true |
| TU-PWD-03 | Comparaison mot de passe incorrect | "AutreMotDePasse", hash | false |
| TU-PWD-04 | Validation politique - conforme | "MonMotDePasse123!" | true |
| TU-PWD-05 | Validation politique - trop court | "Court1!" | false + message erreur |
| TU-PWD-06 | Validation politique - sans majuscule | "monmotdepasse123!" | false + message erreur |
| TU-PWD-07 | Validation politique - sans chiffre | "MonMotDePasseSansChiffre!" | false + message erreur |
| TU-PWD-08 | Validation politique - sans caractère spécial | "MonMotDePasse123" | false + message erreur |

#### 2.1.2 Service Email
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-EMAIL-01 | Envoi email reset password | email, token | Email envoyé (mock) |
| TU-EMAIL-02 | Template email correct | données template | HTML valide |
| TU-EMAIL-03 | Gestion erreur SMTP | config invalide | Exception gérée |

### 2.2 Middlewares

#### 2.2.1 Middleware d'Authentification
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-AUTH-01 | Token JWT valide | Bearer token valide | req.user défini, next() |
| TU-AUTH-02 | Token JWT expiré | Bearer token expiré | 401 Unauthorized |
| TU-AUTH-03 | Token JWT invalide | Bearer token malformé | 401 Unauthorized |
| TU-AUTH-04 | Absence de token | Aucun header | 401 Unauthorized |
| TU-AUTH-05 | Vérification rôle Admin | req.user.role = "Admin" | next() |
| TU-AUTH-06 | Vérification rôle insuffisant | req.user.role = "Worker" | 403 Forbidden |

#### 2.2.2 Middleware de Validation
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-VAL-01 | Données conformes au schéma | JSON valide | next() |
| TU-VAL-02 | Champ requis manquant | JSON incomplet | 400 Bad Request |
| TU-VAL-03 | Type de données incorrect | string au lieu de number | 400 Bad Request |
| TU-VAL-04 | Format email invalide | "notanemail" | 400 Bad Request |

#### 2.2.3 Rate Limiting
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-RATE-01 | Requêtes sous la limite | 5 requêtes/minute | 200 OK |
| TU-RATE-02 | Dépassement limite IP | 11 requêtes/minute | 429 Too Many Requests |
| TU-RATE-03 | Reset après TTL | Attente 1 minute | Compteur réinitialisé |

### 2.3 Modèles Sequelize

#### 2.3.1 Modèle User
| Test ID | Description | Entrée | Résultat Attendu |
|---------|-------------|---------|------------------|
| TU-USER-01 | Création utilisateur valide | Données complètes | Instance créée |
| TU-USER-02 | Email unique | Email existant | Erreur unicité |
| TU-USER-03 | Associations correctes | - | Relations définies |
| TU-USER-04 | Validation des champs | Données invalides | Erreur validation |

## 3. Tests d'Intégration

### 3.1 API Authentification

#### 3.1.1 Login
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-LOGIN-01 | Connexion réussie | POST | /api/users/login | {email, password} valides | 200 + JWT |
| TI-LOGIN-02 | Email incorrect | POST | /api/users/login | email inexistant | 401 Unauthorized |
| TI-LOGIN-03 | Mot de passe incorrect | POST | /api/users/login | password erroné | 401 Unauthorized |
| TI-LOGIN-04 | Données manquantes | POST | /api/users/login | {} | 400 Bad Request |
| TI-LOGIN-05 | Rate limit dépassé | POST | /api/users/login | 11 tentatives | 429 Too Many Requests |

#### 3.1.2 Change Password
| Test ID | Description | Méthode | Endpoint | Headers | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|---------|------------------|
| TI-CHPWD-01 | Changement réussi | POST | /api/users/change-password | JWT valide | {currentPassword, newPassword} | 200 OK |
| TI-CHPWD-02 | Ancien mdp incorrect | POST | /api/users/change-password | JWT valide | currentPassword erroné | 400 Bad Request |
| TI-CHPWD-03 | Nouveau mdp non conforme | POST | /api/users/change-password | JWT valide | newPassword faible | 400 + détails |
| TI-CHPWD-04 | Sans authentification | POST | /api/users/change-password | - | payload valide | 401 Unauthorized |

#### 3.1.3 Forgot Password
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-FORGOT-01 | Email existant | POST | /api/auth/forgot-password | {email: valide} | 200 + message générique |
| TI-FORGOT-02 | Email inexistant | POST | /api/auth/forgot-password | {email: inconnu} | 200 + message générique |
| TI-FORGOT-03 | Format email invalide | POST | /api/auth/forgot-password | {email: "invalid"} | 400 Bad Request |
| TI-FORGOT-04 | Rate limit | POST | /api/auth/forgot-password | 6 requêtes rapides | 429 Too Many Requests |

#### 3.1.4 Reset Password
| Test ID | Description | Méthode | Endpoint | Payload | Résultat Attendu |
|---------|-------------|---------|----------|---------|------------------|
| TI-RESET-01 | Token valide | POST | /api/auth/reset-password | {token, newPassword} | 200 OK |
| TI-RESET-02 | Token expiré | POST | /api/auth/reset-password | token > 20min | 400 Token expiré |
| TI-RESET-03 | Token déjà utilisé | POST | /api/auth/reset-password | token used | 400 Token invalide |
| TI-RESET-04 | Token inexistant | POST | /api/auth/reset-password | token random | 400 Token invalide |
| TI-RESET-05 | Mot de passe non conforme | POST | /api/auth/reset-password | password faible | 400 + détails |

### 3.2 API CRUD

#### 3.2.1 Gestion des Utilisateurs
| Test ID | Description | Méthode | Endpoint | Rôle Requis | Résultat Attendu |
|---------|-------------|---------|----------|-------------|------------------|
| TI-USER-01 | Liste des utilisateurs | GET | /api/users | Admin | 200 + liste |
| TI-USER-02 | Détail utilisateur | GET | /api/users/:id | Admin/Owner | 200 + détails |
| TI-USER-03 | Création utilisateur | POST | /api/users | Admin | 201 Created |
| TI-USER-04 | Modification utilisateur | PUT | /api/users/:id | Admin/Owner | 200 OK |
| TI-USER-05 | Suppression utilisateur | DELETE | /api/users/:id | Admin | 204 No Content |
| TI-USER-06 | Accès non autorisé | GET | /api/users | Worker | 403 Forbidden |

#### 3.2.2 Gestion des Chantiers
| Test ID | Description | Méthode | Endpoint | Rôle Requis | Résultat Attendu |
|---------|-------------|---------|----------|-------------|------------------|
| TI-SITE-01 | Liste des chantiers | GET | /api/construction-sites | Tous | 200 + liste |
| TI-SITE-02 | Création chantier | POST | /api/construction-sites | Admin/Manager | 201 Created |
| TI-SITE-03 | Modification chantier | PUT | /api/construction-sites/:id | Admin/Manager | 200 OK |
| TI-SITE-04 | Upload image chantier | POST | /api/construction-sites/:id/image | Admin/Manager | 200 OK |
| TI-SITE-05 | Suppression chantier | DELETE | /api/construction-sites/:id | Admin | 204 No Content |

## 4. Tests End-to-End (E2E)

### 4.1 Parcours Authentification
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-AUTH-01 | Connexion complète | 1. Page login<br>2. Saisie credentials<br>3. Submit<br>4. Redirection | Dashboard affiché |
| TE2E-AUTH-02 | Déconnexion | 1. Click logout<br>2. Confirmation | Retour page login |
| TE2E-AUTH-03 | Session expirée | 1. Attendre expiration<br>2. Action protégée | Redirection login |

### 4.2 Parcours Reset Password
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-RESET-01 | Reset complet | 1. Click "Mot de passe oublié"<br>2. Saisir email<br>3. Recevoir email<br>4. Click lien<br>5. Nouveau mdp<br>6. Connexion | Connexion réussie |
| TE2E-RESET-02 | Token expiré | 1-4. Idem<br>5. Attendre 21min<br>6. Utiliser lien | Message erreur |

### 4.3 Parcours Métier
| Test ID | Description | Étapes | Résultat Attendu |
|---------|-------------|--------|------------------|
| TE2E-SITE-01 | Création chantier | 1. Menu chantiers<br>2. Bouton créer<br>3. Remplir formulaire<br>4. Valider | Chantier créé et visible |
| TE2E-TASK-01 | Affectation tâche | 1. Sélectionner chantier<br>2. Créer tâche<br>3. Affecter ouvrier<br>4. Sauvegarder | Tâche affectée |


## 5. Tests de Sécurité

### 5.1 Tests OWASP Top 10
| Test ID | Vulnérabilité | Test | Résultat Attendu |
|---------|---------------|------|------------------|
| TS-OWASP-01 | Injection SQL | Payload SQL dans les champs | Requête rejetée |
| TS-OWASP-02 | XSS | Script dans les inputs | Script échappé |
| TS-OWASP-03 | CSRF | Requête cross-origin | Token CSRF requis |
| TS-OWASP-04 | Broken Auth | Tentatives brute force | Rate limit actif |
| TS-OWASP-05 | Sensitive Data | Inspection réponses API | Pas de données sensibles |
| TS-OWASP-06 | XXE | Upload XML malicieux | Parsing sécurisé |
| TS-OWASP-07 | Access Control | Accès ressources autres users | 403 Forbidden |
| TS-OWASP-08 | Security Headers | Scan headers HTTP | CSP, HSTS, etc. présents |

### 5.2 Tests de Pénétration
| Test ID | Type d'Attaque | Méthode | Résultat Attendu |
|---------|----------------|---------|------------------|
| TS-PEN-01 | Brute Force Login | 1000 tentatives/min | Blocage après 10 |
| TS-PEN-02 | Token Manipulation | JWT modifié | Signature invalide |
| TS-PEN-03 | Path Traversal | ../../../etc/passwd | Accès refusé |
| TS-PEN-04 | File Upload | Upload .php/.exe | Types rejetés |

## 6. Tests de Performance

### 6.1 Tests de Charge
| Test ID | Scénario | Charge | Critère Succès |
|---------|----------|--------|----------------|
| TP-LOAD-01 | Login simultané | 100 users | Temps réponse < 500ms |
| TP-LOAD-02 | API CRUD | 50 req/sec | 95% < 300ms |
| TP-LOAD-03 | Upload fichiers | 10 uploads 5MB | Pas de timeout |

### 6.2 Tests de Stress
| Test ID | Scénario | Charge | Comportement Attendu |
|---------|----------|--------|---------------------|
| TP-STRESS-01 | Pic de charge | 500 users | Dégradation gracieuse |
| TP-STRESS-02 | Mémoire saturée | Fuite simulée | Restart automatique |

## 7. Jeux de Données de Test

### 7.1 Utilisateurs de Test
```json
{
  "admin": {
    "email": "admin.test@edifispro.com",
    "password": "AdminTest123!@#",
    "role": "Admin"
  },
  "manager": {
    "email": "manager.test@edifispro.com",
    "password": "ManagerTest123!@#",
    "role": "Manager"
  },
  "worker": {
    "email": "worker.test@edifispro.com",
    "password": "WorkerTest123!@#",
    "role": "Worker"
  }
}
```

### 7.2 Chantiers de Test
```json
[
  {
    "name": "Chantier Test Alpha",
    "state": "En cours",
    "adresse": "123 Rue de Test, 75001 Paris",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  {
    "name": "Chantier Test Beta",
    "state": "Prévu",
    "adresse": "456 Avenue Test, 69001 Lyon",
    "start_date": "2024-06-01",
    "end_date": "2024-11-30"
  }
]
```

### 7.3 Compétences de Test
```json
[
  "Maçonnerie",
  "Électricité",
  "Plomberie",
  "Carrelage",
  "Peinture",
  "Menuiserie"
]
```

## 8. Matrice de Traçabilité

| Exigence | Tests Unitaires | Tests Intégration | Tests E2E | Tests Sécurité |
|----------|-----------------|-------------------|-----------|----------------|
| EF-01 (Création compte) | TU-USER-01 | TI-USER-03 | - | TS-OWASP-05 |
| EF-02 (Authentification) | TU-AUTH-01 | TI-LOGIN-01 | TE2E-AUTH-01 | TS-OWASP-04 |
| EF-06 (Reset password) | TU-PWD-04 | TI-RESET-01 | TE2E-RESET-01 | TS-PEN-02 |
| ENF-04 (JWT sécurisé) | TU-AUTH-02 | TI-LOGIN-01 | - | TS-PEN-02 |
| ENF-05 (Politique mdp) | TU-PWD-04 | TI-CHPWD-03 | - | TS-PEN-01 |
| ENF-08 (Rate limiting) | TU-RATE-01 | TI-LOGIN-05 | - | TS-PEN-01 |

## 9. Environnements de Test

### 9.1 Environnement Local
- **Base de données** : SQLite en mémoire
- **Configuration** : .env.test
- **Données** : Fixtures automatiques

### 9.2 Environnement de Test
- **Base de données** : MySQL dédié test
- **Configuration** : Variables CI/CD
- **Données** : Reset avant chaque suite

### 9.3 Environnement Staging
- **Base de données** : Clone production
- **Configuration** : Proche production
- **Données** : Anonymisées

## 10. Critères d'Acceptation

### 10.1 Critères de Passage
- ✅ Tous les tests critiques (P1) passent
- ✅ Couverture de code > 80%
- ✅ Aucune vulnérabilité critique
- ✅ Performance conforme aux SLA

### 10.2 Critères de Blocage
- ❌ Échec d'un test de sécurité critique
- ❌ Régression sur fonctionnalité majeure
- ❌ Couverture < 70%
- ❌ Temps de réponse > 1s (95 percentile)

## 11. Rapports et Métriques

### 11.1 Métriques Collectées
- Taux de réussite par catégorie
- Couverture de code (statements, branches, functions)
- Temps d'exécution des tests
- Nombre de bugs détectés/corrigés

### 11.2 Format des Rapports
- **Quotidien** : Dashboard CI/CD
- **Hebdomadaire** : Rapport de progression
- **Par Release** : Rapport complet avec recommandations

## 12. Maintenance des Tests

### 12.1 Révision des Tests
- Revue mensuelle des tests obsolètes
- Ajout de tests pour nouvelles fonctionnalités
- Optimisation des tests lents

### 12.2 Documentation
- Mise à jour continue de ce plan
- Wiki des bonnes pratiques de test
- Formation équipe sur nouveaux outils

---

*Plan de tests version 2.0*  
*Dernière mise à jour : [Date]*  
*Validé par : Équipe QA Edifis Pro*
