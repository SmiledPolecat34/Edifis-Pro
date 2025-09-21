import request from 'supertest';
import app from '../../server'; // Import de l'application Express
import { sequelize, User, Role } from '../../models'; // Import des modèles

// Décrit la suite de tests pour le parcours d'authentification
describe('Authentication Flow Integration Test', () => {
  // Avant tous les tests, on synchronise la base de données de test
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // `force: true` recrée les tables, assurant un état propre

    // On peut pré-remplir les rôles nécessaires
    await Role.bulkCreate([
      { role_id: 1, name: 'Admin' },
      { role_id: 2, name: 'Worker' },
      { role_id: 3, name: 'Manager' },
    ]);
  });

  // Après chaque test, on nettoie la table des utilisateurs pour éviter les interférences
  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  // Après tous les tests, on ferme la connexion à la base de données
  afterAll(async () => {
    await sequelize.close();
  });

  // Le test principal
  it('devrait créer un nouvel utilisateur via /api/users, puis le connecter via /api/auth/login', async () => {
    // --- Étape 1 : Inscription (Création de l'utilisateur) ---

    const newUser = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test.user@example.com',
      password: 'Password123!',
      numberphone: '1234567890',
      role_id: 2, // Rôle 'Worker'
    };

    // Envoi de la requête de création
    const registerResponse = await request(app)
      .post('/api/users') // Assumant que c'est la route de création
      .send(newUser);

    // Vérification de la réponse de création
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.message).toBe('Utilisateur créé avec succès');
    expect(registerResponse.body.user.email).toBe(newUser.email);

    // --- Étape 2 : Connexion ---

    const loginCredentials = {
      email: 'test.user@example.com',
      password: 'Password123!',
    };

    // Envoi de la requête de connexion
    const loginResponse = await request(app).post('/api/auth/login').send(loginCredentials);

    // Vérification de la réponse de connexion
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token'); // On vérifie qu'un token JWT est bien retourné
    expect(loginResponse.body.user.email).toBe(loginCredentials.email);
    expect(loginResponse.body.user.role).toBe('Worker');
  });

  it('devrait refuser la connexion avec un mot de passe incorrect', async () => {
    // On crée d'abord un utilisateur pour le test
    const userData = {
      firstname: 'Login',
      lastname: 'Fail',
      email: 'login.fail@example.com',
      password: 'GoodPassword123!',
      numberphone: '0987654321',
      role_id: 2,
    };
    await request(app).post('/api/users').send(userData);

    // Tentative de connexion avec un mauvais mot de passe
    const loginAttempt = {
      email: userData.email,
      password: 'BadPassword',
    };

    const response = await request(app).post('/api/auth/login').send(loginAttempt);

    // Vérification que la connexion est bien refusée avec le statut 401
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Identifiants invalides');
    expect(response.body).not.toHaveProperty('token');
  });
});
