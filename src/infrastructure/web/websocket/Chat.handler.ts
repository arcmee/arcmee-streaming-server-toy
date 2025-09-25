import { Server, Socket } from 'socket.io';
import { SendMessageUseCase } from '../../../application/use-cases/chat/SendMessage.usecase';

export class ChatHandler {
  private io: Server;

  constructor(
    io: Server,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {
    this.io = io;
  }

  public handleConnection(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New client connected: ${socket.id}`);

      socket.on('joinRoom', (streamId: string) => {
        console.log(`Client ${socket.id} joined room ${streamId}`);
        socket.join(streamId);
      });

      socket.on('leaveRoom', (streamId: string) => {
        console.log(`Client ${socket.id} left room ${streamId}`);
        socket.leave(streamId);
      });

      socket.on('sendMessage', async (data: { streamId: string; text: string; userId: string }) => {
        const result = await this.sendMessageUseCase.execute(data);

        if (result.ok) {
          this.io.to(data.streamId).emit('newMessage', result.value);
        } else {
          console.error('Error sending message:', result.error);
          // Optionally, emit an error event back to the sender
          socket.emit('error', { message: result.error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}
