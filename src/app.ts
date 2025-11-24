import express from 'express';
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
import { RedisVodProcessingQueue } from './infrastructure/persistence/redis/RedisVodProcessingQueue';
import { PostgresVodRepository } from './infrastructure/persistence/postgres/repositories/PostgresVodRepository';
import { GetVodsByChannelUseCase } from './application/use-cases/vod/GetVodsByChannel.usecase';
import { GetVodUseCase } from './application/use-cases/vod/GetVod.usecase';
import { UploadVodUseCase } from './application/use-cases/vod/UploadVod.usecase';
import { VodController } from './infrastructure/web/express/controllers/vod.controller';
import { createVodRoutes } from './infrastructure/web/express/routes/vod.routes';
import { PostgresChatRepository } from './infrastructure/persistence/postgres/repositories/PostgresChatRepository';
import { SendMessageUseCase } from './application/use-cases/chat/SendMessage.usecase';
import { config } from './infrastructure/config';
import { PostgresRefreshTokenRepository } from './infrastructure/persistence/postgres/repositories/PostgresRefreshTokenRepository';
import { RefreshTokenManager } from './application/services/RefreshTokenManager';
import { RefreshAccessTokenUseCase } from './application/use-cases/auth/RefreshAccessToken.usecase';
import { LogoutUseCase } from './application/use-cases/auth/Logout.usecase';
import { AuthController } from './infrastructure/web/express/controllers/auth.controller';
import { createAuthRoutes } from './infrastructure/web/express/routes/auth.routes';

export async function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/static', express.static(path.join(__dirname, '../public')));

  // Repositories
  const userRepository = new PostgresUserRepository(prisma);
  const refreshTokenRepository = new PostgresRefreshTokenRepository(prisma);
  const streamRepository = new PostgresStreamRepository(prisma);
  const chatRepository = new PostgresChatRepository(prisma);
  const vodRepository = new PostgresVodRepository(prisma);
  const vodProcessingQueue = new RedisVodProcessingQueue();

  // Services
  const refreshTokenManager = new RefreshTokenManager(refreshTokenRepository, config);

  // Use Cases
  const getUserUseCase = new GetUserUseCase(userRepository);
  const createUserUseCase = new CreateUserUseCase(
    userRepository,
    streamRepository,
    config,
    refreshTokenManager,
  );
  const loginUserUseCase = new LoginUserUseCase(userRepository, config, refreshTokenManager);
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
  const uploadVodUseCase = new UploadVodUseCase(vodProcessingQueue, streamRepository);
  const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(
    refreshTokenManager,
    userRepository,
    config,
  );
  const logoutUseCase = new LogoutUseCase(refreshTokenManager);

  // Controllers
  const userController = new UserController(
    getUserUseCase,
    createUserUseCase,
    loginUserUseCase,
    getChannelInfoUseCase,
  );
  const authController = new AuthController(
    loginUserUseCase,
    refreshAccessTokenUseCase,
    logoutUseCase,
  );
  const streamController = new StreamController(
    updateStreamStatusUseCase,
    getLiveStreamsUseCase,
  );
  const vodController = new VodController(
    getVodsByChannelUseCase,
    getVodUseCase,
    uploadVodUseCase,
  );

  // Routes
  const userRoutes = createUserRoutes(userController);
  const authRoutes = createAuthRoutes(authController);
  const streamRoutes = createStreamRoutes(streamController);
  const vodRoutes = createVodRoutes(vodController);
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/streams', streamRoutes);
  app.use('/api/vods', vodRoutes);

  return { app, sendMessageUseCase, vodProcessingQueue };
}
