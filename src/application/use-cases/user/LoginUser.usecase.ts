import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { LoginUserInputDto, LoginUserOutputDto } from '../../dtos/user/LoginUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginUserInputDto): Promise<LoginUserOutputDto> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // In a real app, use a secret from a config file
    const secret = 'your_jwt_secret'; 
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: '1h',
    });

    return { token };
  }
}
