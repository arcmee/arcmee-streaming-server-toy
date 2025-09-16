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

  // Controller
  const userController = new UserController(
    getUserUseCase,
    createUserUseCase,
    loginUserUseCase,
    getChannelInfoUseCase
  );

  // Routes
  const userRoutes = createUserRoutes(userController);
  app.use('/api/users', userRoutes);

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