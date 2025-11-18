import { GetVodUseCase } from '../GetVod.usecase';
import { FakeVodRepository } from '@src/tests/fakes/FakeVodRepository';
import { Vod } from '@src/domain/entities/vod.entity';
import { VodNotFoundError } from '@src/domain/errors/vod.errors';

describe('GetVodUseCase', () => {
  let getVodUseCase: GetVodUseCase;
  let fakeVodRepository: FakeVodRepository;

  beforeEach(() => {
    fakeVodRepository = new FakeVodRepository();
    getVodUseCase = new GetVodUseCase(fakeVodRepository);
  });

  it('should return a VOD if it exists', async () => {
    // Arrange
    const vod = await fakeVodRepository.create(
      new Vod({
        id: 'vod-1',
        userId: 'user-1',
        streamId: 'stream-1',
        title: 'Test VOD',
        videoUrl: 'url',
        thumbnailUrl: 'thumb_url',
        views: 0,
        duration: 120,
        createdAt: new Date(),
      }),
    );

    // Act
    const result = await getVodUseCase.execute({ vodId: vod.id });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(vod);
    }
  });

  it('should return an error if the VOD does not exist', async () => {
    // Act
    const result = await getVodUseCase.execute({ vodId: 'non-existent-id' });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(VodNotFoundError);
    }
  });
});
