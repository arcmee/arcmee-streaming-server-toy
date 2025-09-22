import { ChatMessage } from "@src/domain/entities/chat.entity";
import { IChatRepository } from "@src/domain/repositories/IChatRepository";

export class FakeChatRepository implements IChatRepository {
  private messages: ChatMessage[] = [];

  async create(message: ChatMessage): Promise<ChatMessage> {
    this.messages.push(message);
    return message;
  }

  async findByStreamId(streamId: string, limit: number, offset: number): Promise<ChatMessage[]> {
    const filteredMessages = this.messages.filter(msg => msg.streamId === streamId);
    return filteredMessages.slice(offset, offset + limit);
  }

  // Helper for tests to clear messages
  clearMessages() {
    this.messages = [];
  }
}
