import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './infrastructure/persistence/postgres/client';
import { ChatHandler } from './infrastructure/web/websocket/Chat.handler';
import { createApp } from './app';

async function main() {
  await prisma.$connect();
  console.log('Prisma connected to database');

  const { app, sendMessageUseCase } = await createApp();

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

  // Initialize Socket.IO Chat Handler
  const chatHandler = new ChatHandler(io, sendMessageUseCase);
  chatHandler.handleConnection();

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main().catch(error => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
