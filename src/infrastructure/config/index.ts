import * as dotenv from 'dotenv';
import { loadJwtConfig } from './jwtConfig';
import { loadRefreshTokenConfig } from './refreshTokenConfig';

dotenv.config();

export const config = {
  jwt: loadJwtConfig(),
  refreshToken: loadRefreshTokenConfig(),
};

export type AppConfig = typeof config;
