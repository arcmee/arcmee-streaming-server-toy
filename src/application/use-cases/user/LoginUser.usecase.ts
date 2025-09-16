import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { LoginUserDto } from '../../dtos/user/LoginUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginUserDto): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials.');
    }

    // NOTE: In a real application, use a secure, environment-variable-based secret key.
    const secretKey = 'your-super-secret-key';
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, {
      expiresIn: '1h',
    });

    return { token };
  }
}