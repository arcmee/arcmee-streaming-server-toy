import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserUseCase } from '../LoginUser.usecase';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { User } from '@src/domain/entities/user.entity';

// Mock the jsonwebtoken library
jest.mock('jsonwebtoken');

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
    const { token } = await loginUserUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert
    expect(token).toBe('fake-jwt-token');
    expect(mockedJwtSign).toHaveBeenCalledWith(
      { userId: 'user-1', email: 'test@example.com' },
      'your-super-secret-key',
      { expiresIn: '1h' },
    );
  });

  it('should throw an error if user is not found', async () => {
    // Act & Assert
    await expect(
      loginUserUseCase.execute({
        email: 'notfound@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw an error if password does not match', async () => {
    // Act & Assert
    await expect(
      loginUserUseCase.execute({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
