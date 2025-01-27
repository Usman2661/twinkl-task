import request from 'supertest';
import { Database } from 'sqlite';

import app from '../../../src/index'; // Ensure this is the correct path to your app
import { closeDb, connectDB } from '../../../src/database/database';

let db: Database | undefined;

beforeAll(async () => {
  db = await connectDB();
});

afterAll(async () => {
  if (db) {
    await closeDb();
  }
});

describe('User API', () => {
  describe('User signup API POST /api/users', () => {
    it('should create a new user when valid data is provided', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: `john${Math.floor(Math.random() * 10000) + 1}@example.com`,
        password: 'Password123',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.fullName).toBe(newUser.fullName);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.userType).toBe(newUser.userType);
    });

    it('should return 400 for missing fullName', async () => {
      const newUser = {
        email: 'john@example.com',
        password: 'Password123',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Full name is required');
    });

    it('should return 400 for invalid email', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should return 400 for invalid password (too short)', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be between 8 and 64 characters');
    });

    it('should return 400 for password missing a digit', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must contain at least one digit');
    });

    it('should return 400 for password missing a lowercase letter', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'PASSWORD123',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must contain at least one lowercase letter');
    });

    it('should return 400 for password missing an uppercase letter', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        userType: 'student',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must contain at least one uppercase letter');
    });

    it('should return 400 for invalid userType', async () => {
      const newUser = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        userType: 'invalidUserType',
        createdAt: '2025-01-01 00:00:00',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User type must be one of: student, teacher, parent, private tutor');
    });
  });

  describe('Get User By Id GET /api/users/{id}', () => {
    it('should get a user by id', async () => {
      const userId = 1;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 when user not found', async () => {
      const nonExistingUserId = 9999;

      const response = await request(app)
        .get(`/api/users/${nonExistingUserId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(`User not found with id=${nonExistingUserId}`);
    });

    it('should return 400 for invalid user id format', async () => {
      const invalidUserId = 'abc';

      const response = await request(app)
        .get(`/api/users/${invalidUserId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`Invalid ID provided; it must be a number provided id = ${invalidUserId}`);
    });
  });
});
