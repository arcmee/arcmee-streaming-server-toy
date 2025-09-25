import { GetChannelInfoUseCase } from '../GetChannelInfo.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { User } from '@src/domain/entities/user.entity';
import { Stream } from '@src/domain/entities/stream.entity';

import { UserNotFoundError } from '@src/domain/errors/user.errors';
import { ChannelInfoResponseDto } from '@src/application/dtos/user/ChannelInfoResponse.dto';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';

describe('GetChannelInfoUseCase', () => {
  let getChannelInfoUseCase: GetChannelInfoUseCase;
  let fakeUserRepository: FakeUserRepository;
  let fakeStreamRepository: FakeStreamRepository;

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();
    fakeStreamRepository = new FakeStreamRepository();
    getChannelInfoUseCase = new GetChannelInfoUseCase(
      fakeUserRepository,
      fakeStreamRepository,
    );

    // Arrange: Create a user and a stream to test against
    const user = new User({
      id: 'user-1',
      email: 'test@example.com',
      username: 'Test User',
      password: 'password',
      streamKey: 'key-123',
    });
    await fakeUserRepository.create(user);

    const stream = new Stream({
      id: 'stream-1',
      userId: 'user-1',
      title: 'Test Stream',
      description: 'A great stream',
      isLive: false,
      thumbnailUrl: null,
    });
    await fakeStreamRepository.create(stream);
  });

  it('should be able to get channel information', async () => {
    // Act
    const result = await getChannelInfoUseCase.execute({ userId: 'user-1' });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const channelInfo = result.value;
      expect(channelInfo).toBeInstanceOf(ChannelInfoResponseDto);
      expect(channelInfo.user).toBeInstanceOf(UserResponseDto);
      expect(channelInfo.user.username).toBe('Test User');
      expect(channelInfo.stream?.title).toBe('Test Stream');
      expect(channelInfo.user).not.toHaveProperty('password');
    }
  });

  it('should return an error if the user does not exist', async () => {
    // Act
    const result = await getChannelInfoUseCase.execute({ userId: 'non-existent-user' });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UserNotFoundError);
    }
  });

  it('should return null for stream if it does not exist', async () => {
    // Arrange: Create a user without a stream
    const userWithoutStream = new User({
      id: 'user-2',
      email: 'test2@example.com',
      username: 'Test User 2',
      password: 'password',
      streamKey: 'key-456',
    });
    await fakeUserRepository.create(userWithoutStream);

    // Act
    const result = await getChannelInfoUseCase.execute({ userId: 'user-2' });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const channelInfo = result.value;
      expect(channelInfo).toBeInstanceOf(ChannelInfoResponseDto);
      expect(channelInfo.user.username).toBe('Test User 2');
      expect(channelInfo.stream).toBeNull();
    }
  });
});