import { Request, Response } from 'express';
import { LoginUserUseCase } from '@src/application/use-cases/user/LoginUser.usecase';
import { RefreshAccessTokenUseCase } from '@src/application/use-cases/auth/RefreshAccessToken.usecase';
import { LogoutUseCase } from '@src/application/use-cases/auth/Logout.usecase';
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  RevokedRefreshTokenError,
} from '@src/domain/errors/auth.errors';

export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await this.loginUserUseCase.execute({ email, password });

    if (result.ok) {
      res.status(200).json(result.value);
    } else {
      res.status(401).json({ message: result.error.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'refreshToken is required.' });
      return;
    }

    const result = await this.refreshAccessTokenUseCase.execute({ refreshToken });
    if (result.ok) {
      res.status(200).json(result.value);
      return;
    }

    if (result.error instanceof InvalidRefreshTokenError) {
      res.status(401).json({ message: result.error.message });
      return;
    }

    if (result.error instanceof ExpiredRefreshTokenError) {
      res.status(401).json({ message: result.error.message });
      return;
    }

    if (result.error instanceof RevokedRefreshTokenError) {
      res.status(403).json({ message: result.error.message });
      return;
    }

    res.status(401).json({ message: 'Unable to refresh token.' });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'refreshToken is required.' });
      return;
    }

    const result = await this.logoutUseCase.execute({ refreshToken });
    if (result.ok) {
      res.status(200).json({ message: 'Logged out.' });
      return;
    }

    if (result.error instanceof InvalidRefreshTokenError) {
      res.status(401).json({ message: result.error.message });
      return;
    }

    res.status(401).json({ message: 'Unable to logout.' });
  }
}
