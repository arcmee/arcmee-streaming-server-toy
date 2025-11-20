export interface RedisConnectionOptions {
  host: string;
  port: number;
}

export function getRedisConnection(): RedisConnectionOptions {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      const port = url.port ? parseInt(url.port, 10) : 6379;
      return { host: url.hostname, port };
    } catch (error) {
      console.error('[Redis] Invalid REDIS_URL, falling back to defaults:', error);
    }
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  };
}
