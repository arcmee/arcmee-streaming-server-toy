import { GetVodsByChannelUseCase } from '../GetVodsByChannel.usecase';
import { FakeVodRepository } from '@src/tests/fakes/FakeVodRepository';
import { Vod } from '@src/domain/entities/vod.entity';

describe('GetVodsByChannelUseCase', () => {
  let getVodsByChannelUseCase: GetVodsByChannelUseCase;
  let fakeVodRepository: FakeVodRepository;

  beforeEach(() => {
    fakeVodRepository = new FakeVodRepository();
    getVodsByChannelUseCase = new GetVodsByChannelUseCase(fakeVodRepository);
  });

  it('should return all VODs for a specific channel', async () => {
    // Arrange
    const channelId = 'user-1';
    const otherChannelId = 'user-2';

    const vod1 = await fakeVodRepository.create(
      new Vod({ id:'', userId: channelId, streamId: 's1', title: 'VOD 1', videoUrl: 'u1', thumbnailUrl: 't1', views: 0, duration: 0, createdAt: new Date() }),
    );
    const vod2 = await fakeVodRepository.create(
      new Vod({ id:'', userId: channelId, streamId: 's2', title: 'VOD 2', videoUrl: 'u2', thumbnailUrl: 't2', views: 0, duration: 0, createdAt: new Date() }),
    );
    await fakeVodRepository.create(
      new Vod({ id:'', userId: otherChannelId, streamId: 's3', title: 'VOD 3', videoUrl: 'u3', thumbnailUrl: 't3', views: 0, duration: 0, createdAt: new Date() }),
    );

    // Act
    const result = await getVodsByChannelUseCase.execute({ channelId });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
      expect(result.value).toEqual(expect.arrayContaining([vod1, vod2]));
    }
  });

  it('should return an empty array if the channel has no VODs', async () => {
    // Arrange
    const channelId = 'user-1';

    // Act
    const result = await getVodsByChannelUseCase.execute({ channelId });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(0);
    }
  });
});
