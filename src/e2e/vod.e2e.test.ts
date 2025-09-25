import request from 'supertest';
import { Express } from 'express';
import { prisma } from '../infrastructure/persistence/postgres/client';
import { createApp } from '../app';
import { User, VOD } from '@prisma/client';
import { IVodProcessingQueue } from '@src/domain/repositories/IVodProcessingQueue';

describe('VOD API (E2E)', () => {
  let app: Express;
  let user1: User, user2: User;
  let vod1: VOD, vod2: VOD;
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
    user1 = await prisma.user.create({ data: { email: 'user1@vod.com', username: 'user1', password: 'p', streamKey: 'sk1' } });
    user2 = await prisma.user.create({ data: { email: 'user2@vod.com', username: 'user2', password: 'p', streamKey: 'sk2' } });

    // Create streams for users
    const stream1 = await prisma.stream.create({ data: { userId: user1.id, title: 's1', description: '' } });
    const stream2 = await prisma.stream.create({ data: { userId: user2.id, title: 's2', description: '' } });

    // Create VODs
    vod1 = await prisma.vOD.create({
      data: {
        userId: user1.id,
        streamId: stream1.id,
        videoUrl: 'url1',
        thumbnailUrl: 'thumb1',
        title: 'VOD 1',
        duration: 120,
      },
    });
    vod2 = await prisma.vOD.create({
        data: {
          userId: user1.id,
          streamId: stream1.id, // Point to the same stream
          videoUrl: 'url2',
          thumbnailUrl: 'thumb2',
          title: 'VOD 2',
          duration: 150,
        },
      });
    await prisma.vOD.create({
        data: {
          userId: user2.id,
          streamId: stream2.id,
          videoUrl: 'url3',
          thumbnailUrl: 'thumb3',
          title: 'VOD 3',
          duration: 180,
        },
      });
  });

  describe('POST /api/vods/upload', () => {
    it('should accept a video upload and add a processing job', async () => {
      // 1. Register and Login to get a token
      const userCredentials = { email: 'uploader@test.com', password: 'password123', username: 'uploader' };
      await request(app).post('/api/users/register').send(userCredentials);
      const loginRes = await request(app).post('/api/users/login').send(userCredentials);
      const token = loginRes.body.token;

      // 2. Define VOD metadata and file path
      const vodData = { title: 'My Uploaded VOD', description: 'This is a test upload' };
      const videoPath = './src/e2e/__tests__/assets/test-video.mp4';

      // 3. Send the upload request
      const response = await request(app)
        .post('/api/vods/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('title', vodData.title)
        .field('description', vodData.description)
        .attach('video', videoPath);

      // 4. Assert the response
      expect(response.status).toBe(202);
      expect(response.body.message).toBe('Upload successful. The video is being processed.');
    });
  });

  describe('GET /api/vods/channel/:channelId', () => {
    it('should return all VODs for a specific channel', async () => {
      const response = await request(app).get(`/api/vods/channel/${user1.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((v: VOD) => v.id).sort()).toEqual([vod1.id, vod2.id].sort());
    });

    it('should return an empty array for a channel with no VODs', async () => {
        const newUser = await prisma.user.create({ data: { email: 'user3@vod.com', username: 'user3', password: 'p', streamKey: 'sk3' } });
        const response = await request(app).get(`/api/vods/channel/${newUser.id}`);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
      });
  });

  describe('GET /api/vods/:id', () => {
    it('should return a specific VOD by its ID', async () => {
        const response = await request(app).get(`/api/vods/${vod1.id}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(vod1.id);
        expect(response.body.title).toBe('VOD 1');
    });

    it('should return 404 if VOD ID does not exist', async () => {
        const response = await request(app).get(`/api/vods/non-existent-id`);

        expect(response.status).toBe(404);
    });
  });
});
