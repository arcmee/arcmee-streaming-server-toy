import { UploadVodUseCase } from '../UploadVod.usecase';
import { FakeVodProcessingQueue } from '@src/tests/fakes/FakeVodProcessingQueue';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';

describe('UploadVodUseCase', () => {
  let uploadVodUseCase: UploadVodUseCase;
  let fakeVodProcessingQueue: FakeVodProcessingQueue;
  let fakeStreamRepository: FakeStreamRepository;

  beforeEach(async () => {
    fakeVodProcessingQueue = new FakeVodProcessingQueue();
    fakeStreamRepository = new FakeStreamRepository();
    uploadVodUseCase = new UploadVodUseCase(fakeVodProcessingQueue, fakeStreamRepository);

    const stream = new Stream({
      id: 'stream-123',
      userId: 'user-123',
      title: 'Test Stream',
      description: '',
      isLive: false,
      thumbnailUrl: null,
    });
    await fakeStreamRepository.create(stream);
  });

  it('should add a VOD processing job to the queue', async () => {
    // Arrange
    const dto = {
      userId: 'user-123',
      title: 'My Test VOD',
      description: 'A description of the test VOD.',
      originalPath: '/path/to/video.mp4',
      originalMimeType: 'video/mp4',
    };

    // Act
    const result = await uploadVodUseCase.execute(dto);

    // Assert
    expect(result.ok).toBe(true);
    expect(fakeVodProcessingQueue.jobs).toHaveLength(1);
    expect(fakeVodProcessingQueue.jobs[0]).toEqual({
      streamId: 'stream-123',
      recordedFilePath: dto.originalPath,
    });
  });
});
