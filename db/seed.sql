-- seed.sql — Jeu de données minimal pour Edifis-Pro (MySQL)
-- Remarque: Ce seed ne crée pas d'utilisateur Admin (hash requis). Il charge les rôles,
-- quelques compétences, un chantier et des tâches d'exemple.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ROLES
INSERT INTO roles (name) VALUES
  ('Admin'),
  ('Worker'),
  ('Manager');

-- COMPETENCES
INSERT INTO competences (name) VALUES
  ('Maçonnerie'),
  ('Plomberie'),
  ('Électricité'),
  ('Menuiserie');

-- UTILISATEURS
-- Admin avec rôle Manager
INSERT INTO users (firstname, lastname, email, numberphone, profile_picture, password, role, role_id)
VALUES ('Admin', 'Manager', 'admin@edifis-pro.com', '0600000000', NULL, '$2b$10$6IDXPiSq7cGO2N4514VQgeGm4Ez2BL3nCKbwi3a.xvqw9u9wkWzHG', 'Manager', 3);

-- CHANTIERS
INSERT INTO construction_site (name, state, description, adresse, start_date, end_date, open_time, end_time, image_url, chef_de_projet_id)
VALUES
  ('Chantier A', 'En cours', 'Rénovation immeuble A', '10 Rue de Paris, 75000 Paris', '2025-01-10', '2025-06-30', '08:00:00', '17:00:00', NULL, NULL);

-- TACHES
INSERT INTO Task (name, description, status, construction_site_id)
VALUES
  ('Démolition', 'Retrait des cloisons existantes', 'En cours', 1),
  ('Électricité', 'Réfection complète du réseau', 'Prévu', 1),
  ('Plomberie', 'Remise aux normes', 'Prévu', 1);

-- FEUILLES DE TEMPS (exemple sans rattacher d'utilisateur)

-- VALUES ('2025-02-01 08:00:00', '2025-02-01 16:00:00', 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
