import * as jwt from 'jsonwebtoken';
import { StringValue } from 'ms';

export interface JwtConfig {
  secret: string;
  expiresIn: StringValue;
  issuer: string;
  algorithm: jwt.Algorithm;
}

export function loadJwtConfig(): JwtConfig {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as StringValue;
  const issuer = process.env.JWT_ISSUER || 'streaming-server';
  const algorithm = (process.env.JWT_ALG as jwt.Algorithm) || 'HS256';

  return {
    secret,
    expiresIn,
    issuer,
    algorithm,
  };
}
