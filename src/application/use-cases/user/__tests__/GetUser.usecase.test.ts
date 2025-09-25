import { GetUserUseCase } from '../GetUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { User } from '@src/domain/entities/user.entity';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';
import { UserNotFoundError } from '@src/domain/errors/user.errors';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let fakeUserRepository: FakeUserRepository;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    getUserUseCase = new GetUserUseCase(fakeUserRepository);
  });

  it('should be able to get a user by id and return a DTO', async () => {
    // Arrange
    const user = new User({
      id: 'user-1',
      email: 'johndoe@example.com',
      username: 'John Doe',
      password: 'hashed-password',
      streamKey: 'stream-key-123',
    });
    await fakeUserRepository.create(user);

    // Act
    const result = await getUserUseCase.execute('user-1');

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeInstanceOf(UserResponseDto);
      expect(result.value.id).toBe('user-1');
      expect(result.value.username).toBe('John Doe');
      expect(result.value).not.toHaveProperty('password');
    }
  });

  it('should return an error if user does not exist', async () => {
    // Act
    const result = await getUserUseCase.execute('non-existent-user');

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(UserNotFoundError);
    }
  });
});