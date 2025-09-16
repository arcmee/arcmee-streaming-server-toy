import { ChatMessage } from '../entities/chat.entity';

export interface IChatRepository {
  create(message: ChatMessage): Promise<ChatMessage>;
  findByStreamId(streamId: string, limit: number, offset: number): Promise<ChatMessage[]>;
}
