import { CreateUserUseCase } from '../CreateUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { User } from '@src/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let fakeUserRepository: FakeUserRepository;
  let fakeStreamRepository: FakeStreamRepository;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeStreamRepository = new FakeStreamRepository();
    createUserUseCase = new CreateUserUseCase(
      fakeUserRepository,
      fakeStreamRepository,
    );
  });

  it('should be able to create a new user and a stream', async () => {
    // Arrange
    const userData = {
      email: 'newuser@example.com',
      username: 'New User',
      password: 'password123',
    };

    // Act
    const user = await createUserUseCase.execute(userData);

    // Assert
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.username).toBe('New User');

    const createdUser = await fakeUserRepository.findById(user.id);
    expect(createdUser).toEqual(user);

    const createdStream = await fakeStreamRepository.findByUserId(user.id);
    expect(createdStream).toBeDefined();
    expect(createdStream?.userId).toBe(user.id);
  });

  it('should throw an error if user with the same email already exists', async () => {
    // Arrange
    const existingUser = new User({
      email: 'existing@example.com',
      username: 'Existing User',
      password: 'password123',
      streamKey: 'key-123',
    });
    await fakeUserRepository.create(existingUser);

    const userData = {
      email: 'existing@example.com',
      username: 'Another User',
      password: 'password456',
    };

    // Act & Assert
    await expect(createUserUseCase.execute(userData)).rejects.toThrow(
      'User with this email already exists',
    );
  });
});
