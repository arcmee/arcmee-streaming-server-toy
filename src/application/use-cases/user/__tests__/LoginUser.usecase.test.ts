import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserUseCase } from '../LoginUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { User } from '@src/domain/entities/user.entity';

// Mock the jsonwebtoken library
jest.mock('jsonwebtoken');

import { InvalidCredentialsError } from '@src/domain/errors/user.errors';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let fakeUserRepository: FakeUserRepository;
  const mockedJwtSign = jwt.sign as jest.Mock;

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();
    loginUserUseCase = new LoginUserUseCase(fakeUserRepository);

    // Mock setup
    mockedJwtSign.mockReturnValue('fake-jwt-token');

    // Arrange: Create a user to test against
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = new User({
      id: 'user-1',
      email: 'test@example.com',
      username: 'Test User',
      password: passwordHash,
      streamKey: 'key-123',
    });
    await fakeUserRepository.create(user);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to login and return a JWT token', async () => {
    // Act
    const result = await loginUserUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.token).toBe('fake-jwt-token');
      expect(mockedJwtSign).toHaveBeenCalledWith(
        { userId: 'user-1', email: 'test@example.com' },
        'your-super-secret-key',
        { expiresIn: '1h' },
      );
    }
  });

  it('should return an error if user is not found', async () => {
    // Act
    const result = await loginUserUseCase.execute({
      email: 'notfound@example.com',
      password: 'password123',
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    }
  });

  it('should return an error if password does not match', async () => {
    // Act
    const result = await loginUserUseCase.execute({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    }
  });
});
