import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserResponseDto } from '@src/application/dtos/user/UserResponse.dto';
import { err, ok, Result } from '@src/domain/utils/Result';
import { UserNotFoundError } from '@src/domain/errors/user.errors';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<Result<UserResponseDto, UserNotFoundError>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return err(new UserNotFoundError());
    }

    return ok(UserResponseDto.fromEntity(user));
  }
}
