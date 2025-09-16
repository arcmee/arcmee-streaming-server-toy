import { IChatRepository } from '../../../../domain/repositories/IChatRepository';
import { ChatMessage } from '../../../../domain/entities/chat.entity';
import { prisma } from '../client';
import { User } from '../../../../domain/entities/user.entity';

export class PostgresChatRepository implements IChatRepository {
  async create(message: ChatMessage): Promise<ChatMessage> {
    const newMessage = await prisma.chatMessage.create({
      data: {
        text: message.text,
        streamId: message.streamId,
        userId: message.userId,
      },
    });
    return new ChatMessage(newMessage);
  }

  async findByStreamId(streamId: string, limit: number, offset: number): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { streamId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return messages.map(msg => new ChatMessage({ ...msg, user: new User(msg.user) }));
  }
}
