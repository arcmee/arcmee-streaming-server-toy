import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SendMessageUseCase } from '../../../application/use-cases/chat/SendMessage.usecase';
import { config } from '@src/infrastructure/config';

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

       // Extract userId from Socket.IO auth token or Authorization header and store on socket
      const rawAuthToken = socket.handshake.auth?.token as string | undefined;
      const authToken = rawAuthToken?.startsWith('Bearer ')
        ? rawAuthToken.slice(7)
        : rawAuthToken;

      const rawHeaderToken = socket.handshake.headers?.authorization as string | undefined;
      const headerToken = rawHeaderToken?.startsWith('Bearer ')
        ? rawHeaderToken.slice(7)
        : rawHeaderToken;

      const token = authToken || headerToken;
      console.log('[chat] socket handshake tokens', {
        socketId: socket.id,
        hasAuthToken: Boolean(rawAuthToken),
        hasHeaderToken: Boolean(rawHeaderToken),
      });

      if (token) {
        try {
          const payload = jwt.verify(token, config.jwt.secret, {
            algorithms: [config.jwt.algorithm],
            issuer: config.jwt.issuer,
          }) as jwt.JwtPayload;
          if (payload && typeof payload === 'object' && typeof payload.userId === 'string') {
            socket.data.userId = payload.userId;
            console.log('[chat] socket authenticated', { socketId: socket.id, userId: payload.userId });
          }
        } catch (error) {
          console.warn('[chat] socket token verification failed', { socketId: socket.id, error });
        }
      } else {
        console.warn('[chat] socket connected without token', { socketId: socket.id });
      }

      socket.on('joinRoom', (streamId: string) => {
        console.log(`Client ${socket.id} joined room ${streamId}`);
        socket.data.streamId = streamId;
        socket.join(streamId);
      });

      socket.on('leaveRoom', (streamId: string) => {
        console.log(`Client ${socket.id} left room ${streamId}`);
        if (socket.data.streamId === streamId) {
          socket.data.streamId = undefined;
        }
        socket.leave(streamId);
      });

      socket.on('sendMessage', async (data: { streamId: string; text: string; userId: string }) => {
        const resolvedStreamId = data?.streamId || (socket.data.streamId as string | undefined);
        const resolvedUserId = data?.userId || (socket.data.userId as string | undefined);

        console.log('[chat] sendMessage received', {
          socketId: socket.id,
          streamId: resolvedStreamId,
          userId: resolvedUserId,
          hasText: Boolean(data?.text),
        });

        if (!resolvedUserId || !resolvedStreamId || !data?.text) {
          const missingAuth = !resolvedUserId;
          const missingStream = !resolvedStreamId;
          const missingText = !data?.text;
          console.warn('[chat] sendMessage missing fields', {
            socketId: socket.id,
            streamId: resolvedStreamId,
            userId: resolvedUserId,
            hasText: Boolean(data?.text),
            missingAuth,
            missingStream,
            missingText,
          });
          if (missingAuth) {
            socket.emit('error', { message: 'Authentication required. Provide a valid token in socket auth.' });
            return;
          }
          socket.emit('error', { message: 'streamId and text are required (joinRoom first or include in payload).' });
          return;
        }

        const result = await this.sendMessageUseCase.execute({
          streamId: resolvedStreamId,
          text: data.text,
          userId: resolvedUserId,
        });

        if (result.ok) {
          console.log('[chat] sendMessage success', {
            socketId: socket.id,
            streamId: resolvedStreamId,
            userId: resolvedUserId,
            messageId: result.value.id,
          });
          this.io.to(resolvedStreamId).emit('newMessage', result.value);
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
