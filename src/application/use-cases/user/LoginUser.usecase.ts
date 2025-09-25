import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { LoginUserDto } from '@src/application/dtos/user/LoginUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { err, ok, Result } from '@src/domain/utils/Result';
import { InvalidCredentialsError } from '@src/domain/errors/user.errors';

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    dto: LoginUserDto,
  ): Promise<Result<{ token: string }, InvalidCredentialsError>> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return err(new InvalidCredentialsError());
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      return err(new InvalidCredentialsError());
    }

    // NOTE: In a real application, use a secure, environment-variable-based secret key.
    const secretKey = 'your-super-secret-key';
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, {
      expiresIn: '1h',
    });

    return ok({ token });
  }
}