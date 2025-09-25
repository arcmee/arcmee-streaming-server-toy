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
    const { username, email, password } = req.body;
    const result = await this.createUserUseCase.execute({ username, email, password });

    if (result.ok) {
      const { user, token } = result.value;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, streamKey, ...publicUser } = user;
      res.status(201).json({ user: publicUser, token });
    } else {
      res.status(409).json({ message: result.error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await this.loginUserUseCase.execute({ email, password });

    if (result.ok) {
      res.status(200).json(result.value);
    } else {
      res.status(401).json({ message: result.error.message });
    }
  }

  async getMyChannelInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await this.getChannelInfoUseCase.execute({ userId });

    if (result.ok) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }

  async getChannelInfo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.getChannelInfoUseCase.execute({ userId: id });

    if (result.ok) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ message: result.error.message });
    }
  }
}