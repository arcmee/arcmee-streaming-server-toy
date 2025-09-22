import { SendMessageUseCase } from '../SendMessage.usecase';
import { FakeChatRepository } from '@src/tests/fakes/FakeChatRepository';
import { FakeUserRepository } from '@src/tests/fakes/FakeUserRepository';
import { ChatMessage } from '@src/domain/entities/chat.entity';
import { User } from '@src/domain/entities/user.entity';

describe('SendMessageUseCase', () => {
  let sendMessageUseCase: SendMessageUseCase;
  let fakeChatRepository: FakeChatRepository;
  let fakeUserRepository: FakeUserRepository;

  let testUser: User;

  beforeEach(async () => {
    fakeChatRepository = new FakeChatRepository();
    fakeUserRepository = new FakeUserRepository();
    sendMessageUseCase = new SendMessageUseCase(
      fakeChatRepository,
      fakeUserRepository,
    );

    testUser = new User({
      id: 'user-1',
      email: 'test@example.com',
      username: 'Test User',
      password: 'password',
      streamKey: 'key-123',
    });
    await fakeUserRepository.create(testUser);

    fakeChatRepository.clearMessages();
  });

  it('should be able to send a message', async () => {
    // Arrange
    const messageData = {
      streamId: 'stream-1',
      userId: testUser.id,
      text: 'Hello, chat!',
    };

    // Act
    const message = await sendMessageUseCase.execute(messageData);

    // Assert
    expect(message).toBeInstanceOf(ChatMessage);
    expect(message.id).toBeDefined();
    expect(message.streamId).toBe('stream-1');
    expect(message.userId).toBe(testUser.id);
    expect(message.text).toBe('Hello, chat!');

    const messagesInRepo = await fakeChatRepository.findByStreamId('stream-1', 10, 0);
    expect(messagesInRepo).toHaveLength(1);
    expect(messagesInRepo[0]).toEqual(message);
  });

  it('should throw an error if user is not found', async () => {
    // Arrange
    const messageData = {
      streamId: 'stream-1',
      userId: 'non-existent-user',
      text: 'Hello, chat!',
    };

    // Act & Assert
    await expect(sendMessageUseCase.execute(messageData)).rejects.toThrow(
      'User not found',
    );
  });
});