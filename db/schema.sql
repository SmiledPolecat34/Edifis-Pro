-- Schema SQL relationnel — Edifis-Pro (MySQL InnoDB)
-- Généré à partir des modèles Sequelize présents dans backend/models/*
-- Tables: roles, users, competences, user_competences, construction_site, Task, user_tasks,
--         password_reset_tokens

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE edifis_pro;

-- 1) Rôles
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('Admin','Worker','Manager','Project_Chief','HR') NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Utilisateurs
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  numberphone VARCHAR(20) NOT NULL UNIQUE,
  profile_picture VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin','Worker','Manager','Project_Chief','HR') NOT NULL DEFAULT 'Worker',
  role_id INT NULL,
  CONSTRAINT fk_users_role_id FOREIGN KEY (role_id)
    REFERENCES roles(role_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Compétences
DROP TABLE IF EXISTS competences;
CREATE TABLE competences (
  competence_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Pivot N-N users <-> competences
DROP TABLE IF EXISTS user_competences;
CREATE TABLE user_competences (
  user_id INT NOT NULL,
  competence_id INT NOT NULL,
  PRIMARY KEY (user_id, competence_id),
  CONSTRAINT fk_uc_user FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_uc_competence FOREIGN KEY (competence_id)
    REFERENCES competences(competence_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Chantiers (construction_site)
DROP TABLE IF EXISTS construction_site;
CREATE TABLE construction_site (
  construction_site_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state ENUM('En cours','Terminé','Annulé','Prévu') NOT NULL,
  description TEXT,
  adresse VARCHAR(255),
  start_date DATE,
  end_date DATE,
  open_time TIME,
  end_time TIME,
  date_creation DATE DEFAULT CURRENT_TIMESTAMP,
  image_url VARCHAR(255),
  chef_de_projet_id INT NULL,
  CONSTRAINT fk_site_manager FOREIGN KEY (chef_de_projet_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) Tâches (tasks)
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('En cours','Terminé','Annulé','Prévu') NOT NULL,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  start_date DATETIME,
  end_date DATETIME,
  construction_site_id INT NULL,
  creator_id INT NULL,
  CONSTRAINT fk_task_site FOREIGN KEY (construction_site_id)
    REFERENCES construction_site(construction_site_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_task_creator FOREIGN KEY (creator_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) Pivot N-N users <-> tasks
DROP TABLE IF EXISTS user_tasks;
CREATE TABLE user_tasks (
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  PRIMARY KEY (user_id, task_id),
  CONSTRAINT fk_ut_user FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_ut_task FOREIGN KEY (task_id)
    REFERENCES tasks(task_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) Jetons de réinitialisation de mot de passe
DROP TABLE IF EXISTS password_reset_tokens;
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL, -- SHA-256 hex
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_prt_user (user_id),
  INDEX idx_prt_token (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
