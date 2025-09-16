import express from 'express';
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

async function main() {
  await prisma.$connect();
  console.log('Prisma connected to database');

  const app = express();
  app.use(express.json());

  // Repositories
  const userRepository = new PostgresUserRepository();
  const streamRepository = new PostgresStreamRepository();

  // Use Cases
  const getUserUseCase = new GetUserUseCase(userRepository);
  const createUserUseCase = new CreateUserUseCase(userRepository, streamRepository);
  const loginUserUseCase = new LoginUserUseCase(userRepository);
  const getChannelInfoUseCase = new GetChannelInfoUseCase(userRepository, streamRepository);
  const updateStreamStatusUseCase = new UpdateStreamStatusUseCase(userRepository, streamRepository);
  const getLiveStreamsUseCase = new GetLiveStreamsUseCase(streamRepository);

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

  // Routes
  const userRoutes = createUserRoutes(userController);
  const streamRoutes = createStreamRoutes(streamController);
  app.use('/api/users', userRoutes);
  app.use('/api/streams', streamRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main().catch(error => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});