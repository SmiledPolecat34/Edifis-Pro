# Guide de lancement du projet Edifis Pro

## 🚀 Comment lancer le projet

### Option 1 : Avec Docker (Recommandé)

1. **Prérequis** : Avoir Docker et Docker Compose installés sur votre machine

2. **Lancer le projet** :
   ```bash
   docker-compose up -d
   ```

3. **Accès aux services** :
   - Backend API : http://localhost:5001
   - Base de données MySQL : localhost:3306

### Option 2 : Sans Docker

#### Backend
1. **Installer les dépendances** :
   ```bash
   cd backend
   npm install
   ```

2. **Créer un fichier `.env`** dans le dossier backend :
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=edifis_pro
   DB_DIALECT=mysql
   JWT_SECRET=votre_secret_jwt
   JWT_EXPIRES_IN=1h
   FRONTEND_URL=http://localhost:5173
   ```

3. **Lancer le backend** :
   ```bash
   npm start
   ```

#### Frontend
1. **Installer les dépendances** :
   ```bash
   cd frontend/edifis-pro
   npm install
   ```

2. **Lancer le frontend** :
   ```bash
   npm run dev
   ```

3. **Accéder à l'application** : http://localhost:5173

## 📋 Fonctionnalités disponibles

### Pages existantes :
- **Login** : `/login` - Page de connexion
- **Home** : `/` - Page d'accueil (après connexion)
- **Profile** : `/profile` - Profil utilisateur
- **Missions** : `/missions` - Gestion des missions
- **Construction** : `/construction` - Gestion des chantiers
- **Worker** : `/worker` - Gestion des ouvriers (Admin uniquement)
- **Compétences** : `/competences` - Gestion des compétences (Admin uniquement)

### ⚠️ Fonctionnalité manquante : Mot de passe oublié

Le backend dispose des endpoints pour la récupération de mot de passe :
- `POST /api/auth/forgot-password` - Pour demander un lien de réinitialisation
- `POST /api/auth/reset-password` - Pour réinitialiser le mot de passe

**MAIS** les pages frontend correspondantes n'existent pas encore. Je vais les créer pour vous.

## 🔐 Identifiants de connexion

### Utilisateur Admin Manager
- **Email** : admin@edifis-pro.com
- **Mot de passe** : AdminEdifis2025!
- **Rôle** : Manager (accès complet à toutes les fonctionnalités)

### Autres utilisateurs
Par défaut, le mot de passe pour les nouveaux utilisateurs créés est : `edifispr@2025`

## 📝 Voir les modifications apportées

Pour voir les modifications récentes :
```bash
git log --oneline -10
```

Pour voir les détails d'une modification :
```bash
git show <commit-id>
```

Pour voir l'état actuel des fichiers modifiés :
```bash
git status
```

Pour voir les différences non commitées :
```bash
git diff
