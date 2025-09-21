import request from 'supertest';
import app from '../../server'; // Adjust path as needed
import sequelize from '../../config/sequelize';
import { User, Role } from '../../models';
import * as authMiddleware from '../../middlewares/auth.middleware'; // Import auth middleware
import * as roleMiddleware from '../../middlewares/role.middleware'; // Import role middleware

describe('User Integration Tests', () => {
  beforeAll(async () => {
    // Mock any necessary models or services here
    // For example, if you need a user to be logged in for these tests,
    // you might mock User.findByPk or similar.
    jest.spyOn(authMiddleware, 'protect').mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'Admin' }; // Mock an admin user
      next();
    });
    jest.spyOn(roleMiddleware, 'isAdmin').mockImplementation((req, res, next) => {
      next();
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/users/all', () => {
    it('should return a list of users', async () => {
      // Mock User.findAll to return some dummy users
      (User.findAll as jest.Mock) = jest.fn().mockResolvedValue([
        { user_id: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' },
        { user_id: 2, firstname: 'Jane', lastname: 'Smith', email: 'jane.smith@example.com' },
      ]);

      const res = await request(app).get('/api/users/all');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toEqual(2);
      expect(res.body[0]).toHaveProperty('firstname', 'John');
    });

    // Add more test cases for different scenarios, e.g., no users, error handling
  });

  // Add more describe blocks for other user routes (GET /api/users/:id, POST /api/users, PUT /api/users/:id, DELETE /api/users/:id)
});
