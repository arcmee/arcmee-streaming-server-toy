import { UploadVodUseCase } from '../UploadVod.usecase';
import { FakeVodProcessingQueue } from '@src/tests/fakes/FakeVodProcessingQueue';

describe('UploadVodUseCase', () => {
  let uploadVodUseCase: UploadVodUseCase;
  let fakeVodProcessingQueue: FakeVodProcessingQueue;

  beforeEach(() => {
    fakeVodProcessingQueue = new FakeVodProcessingQueue();
    uploadVodUseCase = new UploadVodUseCase(fakeVodProcessingQueue);
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
    await uploadVodUseCase.execute(dto);

    // Assert
    expect(fakeVodProcessingQueue.jobs).toHaveLength(1);
    expect(fakeVodProcessingQueue.jobs[0]).toEqual(dto);
  });
});