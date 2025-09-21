# Edifis-Pro 🏗️

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge&logo=githubactions)](.github/workflows/ci-cd.yml)
[![Technologies](https://img.shields.io/badge/Stack-Node.js%20%26%20React-green?style=for-the-badge)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](docker-compose.yml)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)](LICENSE)

**Edifis-Pro est une solution web complète pour la gestion de chantiers, conçue pour les professionnels du bâtiment. Elle permet de centraliser le suivi des tâches, la gestion des équipes et la communication en temps réel.**

---

## 📖 Table des matières

- [🎯 Objectif du projet](#-objectif-du-projet)
- [✨ Fonctionnalités clés](#-fonctionnalités-clés)
- [🏛️ Architecture](#️-architecture)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
  - [Avec Docker (Recommandé)](#avec-docker-recommandé)
  - [Manuellement (Pour le développement)](#manuellement-pour-le-développement)
- [🔧 Variables d'environnement](#-variables-denvironnement)
- [🧪 Lancer les tests](#-lancer-les-tests)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🎯 Objectif du projet

L'objectif d'Edifis-Pro est de fournir une plateforme intuitive et puissante pour digitaliser la gestion des chantiers. L'application s'adresse aux chefs de chantier, aux artisans et à tous les intervenants, en simplifiant la coordination et en offrant une vue d'ensemble claire de l'avancement des projets.

---

## ✨ Fonctionnalités clés

- 👤 **Gestion des utilisateurs & Rôles** : Authentification sécurisée (JWT), gestion des profils, et attribution de rôles (administrateur, chef de chantier, ouvrier).
- 🏗️ **Gestion des chantiers** : Création et suivi de plusieurs chantiers en parallèle, avec informations détaillées et photos.
- 📋 **Gestion des tâches** : Assignation de tâches aux utilisateurs, suivi des statuts (à faire, en cours, terminé) et gestion des dépendances.
- 🛠️ **Gestion des compétences** : Attribution de compétences aux utilisateurs pour faciliter la répartition des tâches.
- 📊 **Tableaux de bord** : Visualisation de l'avancement des projets, des charges de travail et des statistiques clés.
- 🔒 **Sécurité** : Protection contre les attaques courantes, validation des données et middlewares de sécurité.
- 📧 **Services annexes** : Système de réinitialisation de mot de passe par email.

---

## 🏛️ Architecture

Edifis-Pro est construit sur une **architecture client-serveur moderne et découplée** :

- **Backend** : Une API RESTful développée avec **Node.js** et **Express**. Elle suit une architecture en couches (inspirée de MVC) avec une séparation claire des responsabilités :
  - `routes` : Définit les points d'entrée de l'API.
  - `controllers` : Gère les requêtes et les réponses HTTP.
  - `services` : Contient la logique métier complexe.
  - `models` : Interagit avec la base de données via l'ORM **Sequelize**.
- **Frontend** : Une **Single Page Application (SPA)** développée avec **React** et **Vite**. Elle offre une expérience utilisateur fluide et réactive en communiquant avec le backend via des appels API.

L'ensemble de l'application est conteneurisable avec **Docker**, facilitant le déploiement et la mise en place d'un environnement de développement cohérent.

---

## 🛠️ Stack Technique

### Backend

- **Langage** : JavaScript (Node.js)
- **Framework** : Express.js
- **Base de données** : PostgreSQL (ou autre SGBD compatible Sequelize)
- **ORM** : Sequelize
- **Tests** : Jest
- **Authentification** : JSON Web Tokens (JWT)

### Frontend

- **Langage** : TypeScript
- **Framework** : React
- **Outil de build** : Vite
- **Style** : CSS pur / PostCSS (à préciser)
- **Client API** : Axios (ou `fetch`)

### DevOps

- **Conteneurisation** : Docker, Docker Compose
- **Intégration Continue (CI/CD)** : GitHub Actions

---

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

C'est la méthode la plus simple pour lancer l'ensemble du projet.

1.  **Clonez le dépôt :**

    ```bash
    git clone https://github.com/votre-utilisateur/Edifis-Pro.git
    cd Edifis-Pro
    ```

2.  **Configurez les variables d'environnement :**
    - Copiez `.env.example` en `.env` à la racine du projet, dans `backend/` et dans `frontend/edifis-pro/`.
    - Remplissez les fichiers `.env` avec les informations nécessaires (voir la section [Variables d'environnement](#-variables-denvironnement)).

3.  **Lancez les conteneurs :**

    ```bash
    docker-compose up --build
    ```

4.  **Accédez à l'application :**
    - Le frontend sera disponible sur `http://localhost:5173` (ou le port que vous avez configuré).
    - Le backend sera disponible sur `http://localhost:5000`.

### Manuellement (Pour le développement)

#### Backend

1.  Naviguez vers le dossier backend :
    ```bash
    cd backend
    ```
2.  Créez et configurez votre fichier `.env` à partir de `.env.example`.
3.  Installez les dépendances :
    ```bash
    npm install
    ```
4.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

#### Frontend

1.  Naviguez vers le dossier frontend :
    ```bash
    cd frontend/edifis-pro
    ```
2.  Créez et configurez votre fichier `.env` à partir de `.env.example`.
3.  Installez les dépendances :
    ```bash
    npm install
    ```
4.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

---

## 🔧 Variables d'environnement

Vous devez créer un fichier `.env` dans les dossiers `backend` et `frontend/edifis-pro` en vous basant sur les fichiers `.env.example`.

Voici les variables les plus importantes :

**Backend (`backend/.env`)**

```
PORT=5000
DB_HOST=db
DB_USER=votre_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=edifis_pro
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire

**Voir la suite dans `backend/.env.example` pour plus d'options.**
```

**Frontend (`frontend/edifis-pro/.env`)**

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Lancer les tests

Pour exécuter les tests d'intégration et unitaires du backend :

```bash
cd backend
npm test
```

---
