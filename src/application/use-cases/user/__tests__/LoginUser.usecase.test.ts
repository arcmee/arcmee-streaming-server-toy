import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserUseCase } from '../LoginUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { User } from '@src/domain/entities/user.entity';
import { FakeRefreshTokenRepository } from '@src/tests/fakes/FakeRefreshTokenRepository';
import { RefreshTokenManager } from '@src/application/services/RefreshTokenManager';

// Mock the jsonwebtoken library
jest.mock('jsonwebtoken');

import { InvalidCredentialsError } from '@src/domain/errors/user.errors';
import { StringValue } from 'ms';
import { Algorithm } from 'jsonwebtoken';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let fakeUserRepository: FakeUserRepository;
  let fakeRefreshTokenRepository: FakeRefreshTokenRepository;
  let refreshTokenManager: RefreshTokenManager;
  const mockedJwtSign = jwt.sign as jest.Mock;
  const mockConfig = {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1m' as StringValue,
      issuer: 'test-issuer',
      algorithm: 'HS256' as Algorithm,
    },
    refreshToken: {
      length: 8,
      expiresInMs: 1000 * 60 * 60 * 24 * 30,
      hashingRounds: 4,
    },
  };

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();
    fakeRefreshTokenRepository = new FakeRefreshTokenRepository();
    refreshTokenManager = new RefreshTokenManager(fakeRefreshTokenRepository, mockConfig as any);
    loginUserUseCase = new LoginUserUseCase(fakeUserRepository, mockConfig as any, refreshTokenManager);

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
      expect(result.value.refreshToken).toBeDefined();
      expect(mockedJwtSign).toHaveBeenCalledWith(
        { userId: 'user-1', email: 'test@example.com' },
        mockConfig.jwt.secret,
        {
          expiresIn: mockConfig.jwt.expiresIn,
          issuer: mockConfig.jwt.issuer,
          algorithm: mockConfig.jwt.algorithm,
        },
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
