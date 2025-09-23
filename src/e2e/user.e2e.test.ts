import request from 'supertest';
import { Express } from 'express';
import { prisma } from '../infrastructure/persistence/postgres/client';
import { createApp } from '../app';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';

describe('User API (E2E)', () => {
  let app: Express;
  let vodProcessingQueue: IVodProcessingQueue;

  beforeAll(async () => {
    // Connect to the database before running tests
    await prisma.$connect();
    const createdApp = await createApp();
    app = createdApp.app;
    vodProcessingQueue = createdApp.vodProcessingQueue;
  });

  afterAll(async () => {
    // Disconnect from the database after all tests
    await vodProcessingQueue.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up the database before each test, in dependency order
    await prisma.vOD.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user and return 201', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();

      // Verify user and stream were created in the database
      const dbUser = await prisma.user.findUnique({ where: { email: userData.email } });
      expect(dbUser).not.toBeNull();
      const dbStream = await prisma.stream.findUnique({ where: { userId: dbUser?.id } });
      expect(dbStream).not.toBeNull();
    });

    it('should return 409 if email is already taken', async () => {
        const userData = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123',
        };
        // Create user first
        await request(app).post('/api/users/register').send(userData);

        // Attempt to create again
        const response = await request(app)
            .post('/api/users/register')
            .send(userData);

        expect(response.status).toBe(409);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
        // Register a user before each login test
        await request(app).post('/api/users/register').send({
            email: 'login@example.com',
            username: 'loginuser',
            password: 'password123',
        });
    });

    it('should login an existing user and return a token', async () => {
        const loginData = {
            email: 'login@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/api/users/login')
            .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
        const loginData = {
            email: 'login@example.com',
            password: 'wrongpassword',
        };

        const response = await request(app)
            .post('/api/users/login')
            .send(loginData);

        expect(response.status).toBe(401);
    });
  });
});
