import * as dotenv from 'dotenv';
import { loadJwtConfig } from './jwtConfig';

dotenv.config();

export const config = {
  jwt: loadJwtConfig(),
};

export type AppConfig = typeof config;
