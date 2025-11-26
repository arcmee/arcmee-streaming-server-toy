import { NextFunction, Request, Response } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const status = res.statusCode;
    const contentLength = res.get('content-length') || 'unknown';
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
    const userPart = userId ? ` user=${userId}` : '';

    console.log(
      `[HTTP] ${method} ${originalUrl} ${status} ${contentLength}B ${durationMs.toFixed(
        1,
      )}ms${userPart}`,
    );
  });

  next();
};
