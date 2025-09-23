import { GetUserUseCase } from '../GetUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { User } from '@src/domain/entities/user.entity';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let fakeUserRepository: FakeUserRepository;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    getUserUseCase = new GetUserUseCase(fakeUserRepository);
  });

  it('should be able to get a user by id', async () => {
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
    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe('user-1');
    expect(result?.username).toBe('John Doe');
  });

  it('should return null if user does not exist', async () => {
    // Act
    const result = await getUserUseCase.execute('non-existent-user');

    // Assert
    expect(result).toBeNull();
  });
});