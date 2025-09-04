-- seed.sql — Jeu de données minimal pour Edifis-Pro (MySQL)
-- Remarque: Ce seed ne crée pas d'utilisateur Admin (hash requis). Il charge les rôles,
-- quelques compétences, un chantier et des tâches d'exemple.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ROLES
TRUNCATE TABLE roles;
INSERT INTO roles (name) VALUES
  ('Admin'),
  ('Worker'),
  ('Manager'),
  ('Project_Chief');

-- COMPETENCES
TRUNCATE TABLE competences;
INSERT INTO competences (name) VALUES
  ('Maçonnerie'),
  ('Plomberie'),
  ('Électricité'),
  ('Menuiserie');

-- UTILISATEURS
TRUNCATE TABLE users;
-- Admin
INSERT INTO users (firstname, lastname, email, numberphone, profile_picture, password, role, role_id)
VALUES ('Admin', 'User', 'admin@edifis-pro.com', '0600000000', NULL, '$2b$10$6IDXPiSq7cGO2N4514VQgeGm4Ez2BL3nCKbwi3a.xvqw9u9wkWzHG', 'Admin', 1);

-- Worker
INSERT INTO users (firstname, lastname, email, numberphone, profile_picture, password, role, role_id)
VALUES ('Worker', 'User', 'worker@edifis-pro.com', '0600000001', NULL, '$2b$10$6IDXPiSq7cGO2N4514VQgeGm4Ez2BL3nCKbwi3a.xvqw9u9wkWzHG', 'Worker', 2);

-- Manager
INSERT INTO users (firstname, lastname, email, numberphone, profile_picture, password, role, role_id)
VALUES ('Manager', 'User', 'manager@edifis-pro.com', '0600000002', NULL, '$2b$10$6IDXPiSq7cGO2N4514VQgeGm4Ez2BL3nCKbwi3a.xvqw9u9wkWzHG', 'Manager', 3);

-- Chef de projet
INSERT INTO users (firstname, lastname, email, numberphone, profile_picture, password, role, role_id)
VALUES ('Chef', 'Projet', 'chef@edifis-pro.com', '0600000003', NULL, '$2b$10$6IDXPiSq7cGO2N4514VQgeGm4Ez2BL3nCKbwi3a.xvqw9u9wkWzHG', 'Project_Chief', 4);

-- CHANTIERS
TRUNCATE TABLE construction_site;
INSERT INTO construction_site (name, state, description, adresse, start_date, end_date, open_time, end_time, image_url, chef_de_projet_id)
VALUES
  ('Chantier A', 'En cours', 'Rénovation immeuble A', '10 Rue de Paris, 75000 Paris', '2025-01-10', '2025-06-30', '08:00:00', '17:00:00', NULL, 4);

-- TACHES
TRUNCATE TABLE tasks;
INSERT INTO tasks (name, description, status, construction_site_id, creator_id)
VALUES
  ('Démolition', 'Retrait des cloisons existantes', 'En cours', 1, 3),
  ('Électricité', 'Réfection complète du réseau', 'Prévu', 1, 3),
  ('Plomberie', 'Remise aux normes', 'Prévu', 1, 3);

-- USER_TASKS
TRUNCATE TABLE user_tasks;
INSERT INTO user_tasks (user_id, task_id) VALUES (2, 1);


SET FOREIGN_KEY_CHECKS = 1;

-- NOTE: To reinitialize the database, you can run the following commands:
-- mysql -u your_user -p your_database < db/schema.sql
-- mysql -u your_user -p your_database < db/seed.sql