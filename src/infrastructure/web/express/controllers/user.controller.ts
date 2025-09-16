import { Request, Response } from 'express';
import { GetUserUseCase } from '../../../../application/use-cases/user/GetUser.usecase';
import { CreateUserUseCase } from '../../../../application/use-cases/user/CreateUser.usecase';
import { LoginUserUseCase } from '../../../../application/use-cases/user/LoginUser.usecase';
import { GetChannelInfoUseCase } from '../../../../application/use-cases/user/GetChannelInfo.usecase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getChannelInfoUseCase: GetChannelInfoUseCase,
  ) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.getUserUseCase.execute(id);
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, streamKey, ...publicUser } = user;
        res.status(200).json(publicUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      const user = await this.createUserUseCase.execute({ username, email, password });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, streamKey, ...publicUser } = user;
      res.status(201).json(publicUser);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await this.loginUserUseCase.execute({ email, password });
      res.status(200).json(token);
    } catch (error: any) {
      if (error.message.includes('Invalid')) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }

  async getMyChannelInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const channelInfo = await this.getChannelInfoUseCase.execute({ userId });
      res.status(200).json(channelInfo);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }

  async getChannelInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const channelInfo = await this.getChannelInfoUseCase.execute({ userId: id });
      res.status(200).json(channelInfo);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }
}