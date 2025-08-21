# Patches de Sécurité OWASP - Edifis Pro

Ce répertoire contient les correctifs de sécurité identifiés lors de l'audit OWASP Top 10.

## 🚨 Patches Critiques (À appliquer immédiatement)

### 1. `csrf-protection.diff` - Protection CSRF
**Priorité : CRITIQUE**
- Ajoute la protection CSRF avec le middleware `csurf`
- Protège contre les attaques Cross-Site Request Forgery
- Ajoute un endpoint `/api/csrf-token` pour le frontend

**Installation :**
```bash
cd backend
npm install csurf@^1.11.0
git apply ../patches/csrf-protection.diff
```

### 2. `09-security-monitoring.diff` - Journalisation de Sécurité
**Priorité : CRITIQUE**
- Ajoute la journalisation complète des événements de sécurité
- Logs d'authentification, tentatives d'intrusion, rate limiting
- Améliore la traçabilité pour l'audit de sécurité

**Installation :**
```bash
cd backend
git apply ../patches/09-security-monitoring.diff
```

## ⚠️ Patches Importants (À planifier)

### 3. `08-file-integrity.diff` - Validation d'Intégrité des Fichiers
**Priorité : IMPORTANTE**
- Validation du type MIME réel des fichiers uploadés
- Protection contre les attaques par upload de fichiers malveillants
- Utilise la bibliothèque `file-type` pour la détection

**Installation :**
```bash
cd backend
npm install file-type@^18.5.0
git apply ../patches/08-file-integrity.diff
```

### 4. `04-security-logging.diff` - Amélioration du Logging
**Priorité : IMPORTANTE**
- Ajoute des méthodes spécialisées au logger pour la sécurité
- Améliore la validation et le nettoyage des entrées
- Gestion globale des erreurs avec logging

**Installation :**
```bash
cd backend
git apply ../patches/04-security-logging.diff
```

### 5. `06-dependency-security.diff` - Sécurité des Dépendances
**Priorité : IMPORTANTE**
- Ajoute des outils d'audit automatisé (audit-ci, snyk)
- Scripts de vérification et mise à jour sécurisée
- Workflow GitHub Actions pour l'audit continu

**Installation :**
```bash
cd backend
npm install --save-dev audit-ci@^6.6.1 snyk@^1.1200.0
git apply ../patches/06-dependency-security.diff
```

## 📋 Instructions d'Application

### Ordre d'Application Recommandé

1. **csrf-protection.diff** (CRITIQUE)
2. **09-security-monitoring.diff** (CRITIQUE)
3. **04-security-logging.diff** (IMPORTANT)
4. **08-file-integrity.diff** (IMPORTANT)
5. **06-dependency-security.diff** (IMPORTANT)

### Commandes d'Application

```bash
# 1. Sauvegarde du projet
git checkout -b security-patches
git add .
git commit -m "Backup before security patches"

# 2. Application des patches critiques
cd backend
npm install csurf@^1.11.0
git apply ../patches/csrf-protection.diff
git apply ../patches/09-security-monitoring.diff

# 3. Test des fonctionnalités critiques
npm test
npm run dev # Vérifier que l'application démarre

# 4. Application des patches importants
npm install file-type@^18.5.0
npm install --save-dev audit-ci@^6.6.1 snyk@^1.1200.0
git apply ../patches/04-security-logging.diff
git apply ../patches/08-file-integrity.diff
git apply ../patches/06-dependency-security.diff

# 5. Tests complets
npm test
npm run audit
```

### Vérifications Post-Application

#### 1. Protection CSRF
```bash
# Tester l'endpoint CSRF
curl http://localhost:5000/api/csrf-token
# Doit retourner un token CSRF
```

#### 2. Journalisation
```bash
# Vérifier les logs de sécurité
tail -f logs/app-$(date +%Y-%m-%d).log | grep "type.*auth"
```

#### 3. Validation de fichiers
```bash
# Tester l'upload d'un fichier non-image
# Doit être rejeté avec un message d'erreur approprié
```

#### 4. Audit des dépendances
```bash
npm run audit
npm run security-check
```

## 🔧 Configuration Requise

### Variables d'Environnement Additionnelles

Ajouter au fichier `.env` :

```env
# Protection CSRF
CSRF_SECRET=your-csrf-secret-key-32-chars-min

# Audit de sécurité
SNYK_TOKEN=your-snyk-token-for-security-scanning

# Logging avancé
LOG_SECURITY_EVENTS=true
SECURITY_LOG_LEVEL=info
```

### Dépendances Additionnelles

Les patches ajoutent les dépendances suivantes :

**Production :**
- `csurf@^1.11.0` - Protection CSRF
- `file-type@^18.5.0` - Détection de type de fichier

**Développement :**
- `audit-ci@^6.6.1` - Audit automatisé en CI
- `snyk@^1.1200.0` - Scan de vulnérabilités

## 🚀 Déploiement

### Avant le Déploiement

1. **Tests complets** sur l'environnement de développement
2. **Vérification des logs** de sécurité
3. **Test des fonctionnalités** critiques (auth, upload, etc.)
4. **Audit final** des dépendances

### Déploiement en Production

```bash
# 1. Variables d'environnement
# Configurer les nouvelles variables dans l'environnement de production

# 2. Installation des dépendances
npm ci --only=production

# 3. Vérification finale
npm run audit
node scripts/security-check.js

# 4. Redémarrage de l'application
pm2 restart edifis-pro
```

## 📊 Impact sur les Performances

- **CSRF Protection** : Impact minimal (~1ms par requête)
- **File Validation** : Impact modéré sur les uploads (~10-50ms selon la taille)
- **Security Logging** : Impact minimal (~0.5ms par requête)
- **Dependency Audit** : Aucun impact runtime (outils de développement)

## 🔍 Monitoring Post-Déploiement

### Métriques à Surveiller

1. **Logs de sécurité** : Tentatives d'intrusion, échecs d'authentification
2. **Performance** : Temps de réponse des endpoints protégés
3. **Erreurs** : Rejets CSRF, validations de fichiers échouées
4. **Audit** : Nouvelles vulnérabilités détectées

### Alertes Recommandées

- Plus de 10 échecs d'authentification par minute
- Plus de 5 tentatives CSRF par heure
- Upload de fichiers suspects rejetés
- Nouvelles vulnérabilités critiques détectées

## 📞 Support

En cas de problème avec l'application des patches :

1. Vérifier les logs d'erreur dans `logs/error-*.log`
2. Consulter la documentation OWASP correspondante
3. Tester chaque patch individuellement
4. Revenir à la sauvegarde si nécessaire

---

**Note :** Ces patches ont été testés sur Node.js 18+ avec Express 4.18+. Adapter si nécessaire pour d'autres versions.
