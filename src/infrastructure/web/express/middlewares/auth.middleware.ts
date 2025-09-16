import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// A new interface that extends Express's Request to include the user payload
export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // NOTE: Use the same secure, environment-variable-based secret key as in the login use case.
    const secretKey = 'your-super-secret-key';
    const decoded = jwt.verify(token, secretKey) as { userId: string; email: string };
    req.user = decoded; // Attach user payload to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};