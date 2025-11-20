import { IChatRepository } from '@src/domain/repositories/IChatRepository';
import { IUserRepository } from '@src/domain/repositories/IUserRepository';
import { ChatMessage } from '@src/domain/entities/chat.entity';
import { SendMessageDto } from '@src/application/dtos/chat/SendMessage.dto';
import { createId } from '@paralleldrive/cuid2';
import { err, ok, Result } from '@src/domain/utils/Result';
import { UserNotFoundError } from '@src/domain/errors/user.errors';

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: SendMessageDto,
  ): Promise<Result<ChatMessage, UserNotFoundError>> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      return err(new UserNotFoundError());
    }

    const chatMessage = new ChatMessage({
      id: createId(),
      text: dto.text,
      streamId: dto.streamId,
      userId: dto.userId,
      createdAt: new Date(),
    });

    const savedMessage = await this.chatRepository.create(chatMessage);

    // Attach user object to the message for broadcasting
    savedMessage.user = user;

    return ok(savedMessage);
  }
}
