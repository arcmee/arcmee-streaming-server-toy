import request from 'supertest';
import { Express } from 'express';
import { prisma } from '../infrastructure/persistence/postgres/client';
import { createApp } from '../app';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';

describe('Stream API (E2E)', () => {
  let app: Express;
  let user1: any, user2: any;
  let vodProcessingQueue: IVodProcessingQueue;

  beforeAll(async () => {
    await prisma.$connect();
    const createdApp = await createApp();
    app = createdApp.app;
    vodProcessingQueue = createdApp.vodProcessingQueue;
  });

  afterAll(async () => {
    await vodProcessingQueue.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up the database
    await prisma.vOD.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    user1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        username: 'user1',
        password: 'password',
        streamKey: 'key1',
      },
    });
    user2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        username: 'user2',
        password: 'password',
        streamKey: 'key2',
      },
    });
  });

  describe('GET /api/streams', () => {
    it('should return only live streams', async () => {
      // Arrange: create one live and one offline stream
      await prisma.stream.create({
        data: { userId: user1.id, title: 'Live Stream', description: '', isLive: true },
      });
      await prisma.stream.create({
        data: { userId: user2.id, title: 'Offline Stream', description: '', isLive: false },
      });

      // Verify data creation before API call
      const liveStreamInDb = await prisma.stream.findFirst({ where: { userId: user1.id } });
      expect(liveStreamInDb?.isLive).toBe(true);

      // Act
      const response = await request(app).get('/api/streams');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user1.id);
      expect(response.body[0].isLive).toBe(true);
    });
  });

  describe('POST /api/streams/webhooks', () => {
    it('should update a stream to live when receiving a post_publish event', async () => {
      // Arrange
      await prisma.stream.create({ data: { userId: user1.id, title: 'User 1 Stream', description: '' } });

      // Act
      const response = await request(app)
        .post('/api/streams/webhooks')
        .send({ streamKey: user1.streamKey, event: 'post_publish' });

      // Assert
      expect(response.status).toBe(200);
      const streamInDb = await prisma.stream.findUnique({ where: { userId: user1.id } });
      expect(streamInDb?.isLive).toBe(true);
    });

    it('should update a stream to offline when receiving a done_publish event', async () => {
        // Arrange
        await prisma.stream.create({ data: { userId: user1.id, title: 'User 1 Stream', description: '', isLive: true } });

        // Act
        const response = await request(app)
          .post('/api/streams/webhooks')
          .send({ streamKey: user1.streamKey, event: 'done_publish' });
  
        // Assert
        expect(response.status).toBe(200);
        const streamInDb = await prisma.stream.findUnique({ where: { userId: user1.id } });
        expect(streamInDb?.isLive).toBe(false);
      });

    it('should return 204 for an irrelevant event', async () => {
        // Arrange
        await prisma.stream.create({ data: { userId: user1.id, title: 'User 1 Stream', description: '' } });

        // Act
        const response = await request(app)
          .post('/api/streams/webhooks')
          .send({ streamKey: user1.streamKey, event: 'other_event' });
  
        // Assert
        expect(response.status).toBe(204);
    });
  });
});
