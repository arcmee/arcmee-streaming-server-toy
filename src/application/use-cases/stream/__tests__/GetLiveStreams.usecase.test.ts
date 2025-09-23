import { GetLiveStreamsUseCase } from '../GetLiveStreams.usecase';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { Stream } from '@src/domain/entities/stream.entity';

describe('GetLiveStreamsUseCase', () => {
  let getLiveStreamsUseCase: GetLiveStreamsUseCase;
  let fakeStreamRepository: FakeStreamRepository;

  beforeEach(() => {
    fakeStreamRepository = new FakeStreamRepository();
    getLiveStreamsUseCase = new GetLiveStreamsUseCase(fakeStreamRepository);
  });

  it('should return only live streams', async () => {
    // Arrange
    const liveStream1 = new Stream({
      id: 'stream-1',
      userId: 'user-1',
      title: 'Live Stream 1',
      description: 'Description 1',
      isLive: true,
      thumbnailUrl: null,
    });
    const liveStream2 = new Stream({
      id: 'stream-2',
      userId: 'user-2',
      title: 'Live Stream 2',
      description: 'Description 2',
      isLive: true,
      thumbnailUrl: null,
    });
    const offlineStream = new Stream({
      id: 'stream-3',
      userId: 'user-3',
      title: 'Offline Stream',
      description: 'Description 3',
      isLive: false,
      thumbnailUrl: null,
    });

    await fakeStreamRepository.create(liveStream1);
    await fakeStreamRepository.create(liveStream2);
    await fakeStreamRepository.create(offlineStream);

    // Act
    const result = await getLiveStreamsUseCase.execute();

    // Assert
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([liveStream1, liveStream2]));
    expect(result).not.toEqual(expect.arrayContaining([offlineStream]));
  });

  it('should return an empty array if no live streams are available', async () => {
    // Arrange
    const offlineStream = new Stream({
      id: 'stream-3',
      userId: 'user-3',
      title: 'Offline Stream',
      description: 'Description 3',
      isLive: false,
      thumbnailUrl: null,
    });
    await fakeStreamRepository.create(offlineStream);

    // Act
    const result = await getLiveStreamsUseCase.execute();

    // Assert
    expect(result).toHaveLength(0);
  });
});
