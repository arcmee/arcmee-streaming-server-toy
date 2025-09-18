import { PrismaClient, ChatMessage as PrismaChatMessage, User as PrismaUser } from '@prisma/client';
import { ChatMessage } from '@src/domain/entities/chat.entity';
import { User } from '@src/domain/entities/user.entity';
import { IChatRepository } from '@src/domain/repositories/IChatRepository';

export class PostgresChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(message: PrismaChatMessage & { user?: PrismaUser }): ChatMessage {
    const msgProps: any = { ...message };
    if (message.user) {
      msgProps.user = new User({ ...message.user });
    }
    return new ChatMessage(msgProps);
  }

  async create(message: ChatMessage): Promise<ChatMessage> {
    const { id, user, ...messageData } = message; // user is optional and shouldn't be in create data
    const newMessage = await this.prisma.chatMessage.create({
      data: {
        ...messageData,
        id: id,
      },
    });
    return this.toDomain(newMessage);
  }

  async findByStreamId(streamId: string, limit: number, offset: number): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { streamId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return messages.map(msg => this.toDomain(msg));
  }
}
