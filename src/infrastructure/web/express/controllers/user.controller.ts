import { Request, Response } from 'express';
import { GetUserUseCase } from '../../../../application/use-cases/user/GetUser.usecase';

export class UserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.getUserUseCase.execute(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
