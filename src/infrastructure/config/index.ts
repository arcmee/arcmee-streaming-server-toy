import * as dotenv from 'dotenv';
import { StringValue } from 'ms';

dotenv.config();

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as StringValue,
  },
  // Add other configurations here
};

export type AppConfig = typeof config;
