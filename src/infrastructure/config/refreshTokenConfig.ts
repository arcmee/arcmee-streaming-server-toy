function parseDurationToMs(raw: string): number {
  const value = raw.trim();
  const match = value.match(/^(\d+)([smhd]?)$/i);
  if (!match) {
    throw new Error('Invalid REFRESH_TOKEN_EXPIRES_IN format. Use number or number+unit (s|m|h|d).');
  }
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  if (!unit) {
    return amount; // treat bare number as milliseconds
  }

  return amount * unitToMs[unit];
}

export interface RefreshTokenConfig {
  length: number;
  expiresInMs: number;
  hashingRounds: number;
}

export function loadRefreshTokenConfig(): RefreshTokenConfig {
  const length = Number(process.env.REFRESH_TOKEN_LENGTH || 64);
  const expiresRaw = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  const hashingRounds = Number(process.env.REFRESH_TOKEN_BCRYPT_ROUNDS || 10);

  if (Number.isNaN(length) || length <= 0) {
    throw new Error('REFRESH_TOKEN_LENGTH must be a positive number.');
  }

  const expiresInMs = parseDurationToMs(expiresRaw);

  if (Number.isNaN(hashingRounds) || hashingRounds <= 0) {
    throw new Error('REFRESH_TOKEN_BCRYPT_ROUNDS must be a positive number.');
  }

  return {
    length,
    expiresInMs,
    hashingRounds,
  };
}
