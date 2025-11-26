import { GetLiveStreamsUseCase } from '../GetLiveStreams.usecase';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { Stream } from '@src/domain/entities/stream.entity';
import { User } from '@src/domain/entities/user.entity';

describe('GetLiveStreamsUseCase', () => {
  let getLiveStreamsUseCase: GetLiveStreamsUseCase;
  let fakeStreamRepository: FakeStreamRepository;
  let fakeUserRepository: FakeUserRepository;

  beforeEach(() => {
    fakeStreamRepository = new FakeStreamRepository();
    fakeUserRepository = new FakeUserRepository();
    getLiveStreamsUseCase = new GetLiveStreamsUseCase(fakeStreamRepository, fakeUserRepository);
  });

  it('should return only live streams', async () => {
    // Arrange
    const user1 = new User({
      id: 'user-1',
      username: 'user1',
      email: 'user1@example.com',
      password: 'hash',
      streamKey: 'key-1',
    });
    const user2 = new User({
      id: 'user-2',
      username: 'user2',
      email: 'user2@example.com',
      password: 'hash',
      streamKey: 'key-2',
    });
    const user3 = new User({
      id: 'user-3',
      username: 'user3',
      email: 'user3@example.com',
      password: 'hash',
      streamKey: 'key-3',
    });

    await fakeUserRepository.create(user1);
    await fakeUserRepository.create(user2);
    await fakeUserRepository.create(user3);

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
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
      expect(result.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: liveStream1.id, streamKey: user1.streamKey }),
          expect.objectContaining({ id: liveStream2.id, streamKey: user2.streamKey }),
        ]),
      );
      expect(result.value).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: offlineStream.id })]));
    }
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
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(0);
    }
  });
});
