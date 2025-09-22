import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as path from 'path';

import { prisma } from './infrastructure/persistence/postgres/client';
import { PostgresUserRepository } from './infrastructure/persistence/postgres/repositories/PostgresUserRepository';
import { GetUserUseCase } from './application/use-cases/user/GetUser.usecase';
import { UserController } from './infrastructure/web/express/controllers/user.controller';
import { createUserRoutes } from './infrastructure/web/express/routes/user.routes';
import { CreateUserUseCase } from './application/use-cases/user/CreateUser.usecase';
import { LoginUserUseCase } from './application/use-cases/user/LoginUser.usecase';
import { GetChannelInfoUseCase } from './application/use-cases/user/GetChannelInfo.usecase';
import { PostgresStreamRepository } from './infrastructure/persistence/postgres/repositories/PostgresStreamRepository';
import { UpdateStreamStatusUseCase } from './application/use-cases/stream/UpdateStreamStatus.usecase';
import { GetLiveStreamsUseCase } from './application/use-cases/stream/GetLiveStreams.usecase';
import { StreamController } from './infrastructure/web/express/controllers/stream.controller';
import { createStreamRoutes } from './infrastructure/web/express/routes/stream.routes';
import { ChatHandler } from './infrastructure/web/websocket/Chat.handler';
import { PostgresChatRepository } from './infrastructure/persistence/postgres/repositories/PostgresChatRepository';
import { SendMessageUseCase } from './application/use-cases/chat/SendMessage.usecase';
import { RedisVodProcessingQueue } from './infrastructure/persistence/redis/RedisVodProcessingQueue';
import { PostgresVodRepository } from './infrastructure/persistence/postgres/repositories/PostgresVodRepository';
import { GetVodsByChannelUseCase } from './application/use-cases/vod/GetVodsByChannel.usecase';
import { GetVodUseCase } from './application/use-cases/vod/GetVod.usecase';
import { VodController } from './infrastructure/web/express/controllers/vod.controller';
import { createVodRoutes } from './infrastructure/web/express/routes/vod.routes';

async function main() {
  await prisma.$connect();
  console.log('Prisma connected to database');

  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // In a real production app, restrict this to your frontend's URL
    },
  });

  app.use(express.json());
  app.use('/static', express.static(path.join(__dirname, '../public')));

  // Repositories
  const userRepository = new PostgresUserRepository(prisma);
  const streamRepository = new PostgresStreamRepository(prisma);
  const chatRepository = new PostgresChatRepository(prisma);
  const vodRepository = new PostgresVodRepository(prisma);
  const vodProcessingQueue = new RedisVodProcessingQueue();

  // Use Cases
  const getUserUseCase = new GetUserUseCase(userRepository);
  const createUserUseCase = new CreateUserUseCase(userRepository, streamRepository);
  const loginUserUseCase = new LoginUserUseCase(userRepository);
  const getChannelInfoUseCase = new GetChannelInfoUseCase(userRepository, streamRepository);
  const updateStreamStatusUseCase = new UpdateStreamStatusUseCase(
    userRepository,
    streamRepository,
    vodProcessingQueue,
  );
  const getLiveStreamsUseCase = new GetLiveStreamsUseCase(streamRepository);
  const sendMessageUseCase = new SendMessageUseCase(chatRepository, userRepository);
  const getVodsByChannelUseCase = new GetVodsByChannelUseCase(vodRepository);
  const getVodUseCase = new GetVodUseCase(vodRepository);

  // Controllers
  const userController = new UserController(
    getUserUseCase,
    createUserUseCase,
    loginUserUseCase,
    getChannelInfoUseCase
  );
  const streamController = new StreamController(
    updateStreamStatusUseCase,
    getLiveStreamsUseCase
  );
  const vodController = new VodController(getVodsByChannelUseCase, getVodUseCase);

  // Routes
  const userRoutes = createUserRoutes(userController);
  const streamRoutes = createStreamRoutes(streamController);
  const vodRoutes = createVodRoutes(vodController);
  app.use('/api/users', userRoutes);
  app.use('/api/streams', streamRoutes);
  app.use('/api/vods', vodRoutes);

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
