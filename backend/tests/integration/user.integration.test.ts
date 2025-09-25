import request from 'supertest';
import app from '../../server';
import { sequelize } from '../../models'; // Import sequelize instance
import { User } from '../../models';

describe('User Integration Tests', () => {
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
