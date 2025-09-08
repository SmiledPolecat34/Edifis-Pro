import request from 'supertest';
import app from '../../server'; // Adjust path as needed
import sequelize from '../../config/sequelize';
import { User, Role } from '../../models';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Mock User.findOne, Role.findOne, and User.create
    (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
    (Role.findOne as jest.Mock).mockImplementation(({ where: { name } }) => {
      if (name === 'Worker') {
        return { role_id: 2, name: 'Worker' }; // Mock a valid Worker role
      }
      return null;
    });
    (User.create as jest.Mock).mockImplementation((userData) => ({
      user_id: 1,
      ...userData,
    }));
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'Worker',
          numberphone: '1234567890'
        });

      expect(res.statusCode).toEqual(201);
      console.log(res.body);
      expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');
      // You might want to add more assertions here, e.g., check if user exists in DB
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'password123',
          roleId: 1
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    // Add more test cases for invalid inputs, existing user, etc.
  });

  // Add more describe blocks for other authentication routes (login, forgotPassword, etc.)
});
