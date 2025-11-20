import { UpdateStreamStatusUseCase } from '../UpdateStreamStatus.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { FakeVodProcessingQueue } from '@src/tests/fakes/FakeVodProcessingQueue';
import { User } from '@src/domain/entities/user.entity';
import { Stream } from '@src/domain/entities/stream.entity';
import { UserNotFoundError } from '@src/domain/errors/user.errors';
import { StreamNotFoundError } from '@src/domain/errors/stream.errors';
import * as path from 'path';

describe('UpdateStreamStatusUseCase', () => {
  let updateStreamStatusUseCase: UpdateStreamStatusUseCase;
  let fakeUserRepository: FakeUserRepository;
  let fakeStreamRepository: FakeStreamRepository;
  let fakeVodProcessingQueue: FakeVodProcessingQueue;

  let testUser: User;
  let testStream: Stream;

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();
    fakeStreamRepository = new FakeStreamRepository();
    fakeVodProcessingQueue = new FakeVodProcessingQueue();

    updateStreamStatusUseCase = new UpdateStreamStatusUseCase(
      fakeUserRepository,
      fakeStreamRepository,
      fakeVodProcessingQueue,
    );

    // Arrange: Setup a common user and stream for tests
    testUser = new User({
      id: 'user-1',
      email: 'test@example.com',
      username: 'Test User',
      password: 'password',
      streamKey: 'key-123',
    });
    await fakeUserRepository.create(testUser);

    testStream = new Stream({
      id: 'stream-1',
      userId: testUser.id,
      title: 'Test Stream',
      description: 'A great stream',
      isLive: false,
      thumbnailUrl: null,
    });
    await fakeStreamRepository.create(testStream);

    fakeVodProcessingQueue.clear(); // Clear jobs before each test
  });

  it('should update stream status to live when stream starts', async () => {
    // Act
    const result = await updateStreamStatusUseCase.execute({
      streamKey: testUser.streamKey,
      isLive: true,
    });

    // Assert
    expect(result.ok).toBe(true);
    const streamInRepo = await fakeStreamRepository.findById(testStream.id);
    expect(streamInRepo?.isLive).toBe(true);
    expect(fakeVodProcessingQueue.jobs).toHaveLength(0);
  });

  it('should update stream status to not live and add VOD job when stream ends', async () => {
    // Arrange: Make stream live first
    testStream.isLive = true;
    await fakeStreamRepository.update(testStream);

    // Act
    const result = await updateStreamStatusUseCase.execute({
      streamKey: testUser.streamKey,
      isLive: false,
    });

    // Assert
    expect(result.ok).toBe(true);
    const streamInRepo = await fakeStreamRepository.findById(testStream.id);
    expect(streamInRepo?.isLive).toBe(false);
    expect(fakeVodProcessingQueue.jobs).toHaveLength(1);
    expect(fakeVodProcessingQueue.jobs[0]).toEqual({
      streamId: testStream.id,
      recordedFilePath: path.join('path', 'to', 'recordings', `${testUser.streamKey}.flv`),
    });
  });

  it('should return a UserNotFoundError if user is not found', async () => {
    // Act
    const result = await updateStreamStatusUseCase.execute({
      streamKey: 'non-existent-key',
      isLive: true,
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UserNotFoundError);
    }
  });

  it('should return a StreamNotFoundError if stream is not found for the user', async () => {
    // Arrange: User exists, but has no stream associated
    const userWithoutStream = new User({
      id: 'user-2',
      email: 'test2@example.com',
      username: 'Test User 2',
      password: 'password',
      streamKey: 'key-456',
    });
    await fakeUserRepository.create(userWithoutStream);

    // Act
    const result = await updateStreamStatusUseCase.execute({
      streamKey: userWithoutStream.streamKey,
      isLive: true,
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(StreamNotFoundError);
    }
  });
});
