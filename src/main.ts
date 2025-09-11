import express, { Application } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Infrastructure
import { PostgresUserRepository } from './infrastructure/persistence/postgres/repositories/PostgresUserRepository';
import { UserController } from './infrastructure/web/express/controllers/user.controller';
import { createApiRoutes } from './infrastructure/web/express/routes';

// Application
import { GetUserUseCase } from './application/use-cases/user/GetUser.usecase';

// --- COMPOSITION ROOT ---
// 1. Create instances of infrastructure (lowest level)
const userRepository = new PostgresUserRepository();

// 2. Create instances of application use cases, injecting dependencies
const getUserUseCase = new GetUserUseCase(userRepository);

// 3. Create instances of web controllers, injecting use cases
const userController = new UserController(getUserUseCase);

// --- SERVER SETUP ---
const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const PORT = process.env.PORT || 4000;

app.use(express.json());

// Setup routes
app.use('/api', createApiRoutes(userController));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Handle websocket connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
