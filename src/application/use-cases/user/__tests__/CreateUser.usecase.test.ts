import { CreateUserUseCase } from '../CreateUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { User } from '@src/domain/entities/user.entity';
import { DuplicateUserError } from '@src/domain/errors/user.errors';
import { StringValue } from 'ms';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';
import { Algorithm } from 'jsonwebtoken';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let fakeUserRepository: FakeUserRepository;
  let fakeStreamRepository: FakeStreamRepository;

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeStreamRepository = new FakeStreamRepository();
    const mockConfig = {
      jwt: {
        secret: 'test-secret',
        expiresIn: '1m' as StringValue,
        issuer: 'test-issuer',
        algorithm: 'HS256' as Algorithm,
      },
    };
    createUserUseCase = new CreateUserUseCase(
      fakeUserRepository,
      fakeStreamRepository,
      mockConfig,
    );
  });

  it('should be able to create a new user and a stream, and return a DTO', async () => {
    // Arrange
    const userData = {
      email: 'newuser@example.com',
      username: 'New User',
      password: 'password123',
    };

    // Act
    const result = await createUserUseCase.execute(userData);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const { user, token } = result.value;
      expect(user).toBeInstanceOf(UserResponseDto);
      expect(user.id).toBeDefined();
      expect(token).toBeDefined();
      expect(user.username).toBe('New User');
      expect(user).not.toHaveProperty('password');

      const createdUserInDb = await fakeUserRepository.findById(user.id!);
      expect(createdUserInDb).toBeDefined();

      const createdStream = await fakeStreamRepository.findByUserId(user.id!);
      expect(createdStream).toBeDefined();
      expect(createdStream?.userId).toBe(user.id);
    }
  });

  it('should return an error if user with the same email already exists', async () => {
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

    // Act
    const result = await createUserUseCase.execute(userData);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(DuplicateUserError);
    }
  });
});
