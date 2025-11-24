export class InvalidRefreshTokenError extends Error {
  constructor(message = 'Invalid refresh token.') {
    super(message);
    this.name = 'InvalidRefreshTokenError';
  }
}

export class ExpiredRefreshTokenError extends Error {
  constructor(message = 'Refresh token expired.') {
    super(message);
    this.name = 'ExpiredRefreshTokenError';
  }
}

export class RevokedRefreshTokenError extends Error {
  constructor(message = 'Refresh token revoked.') {
    super(message);
    this.name = 'RevokedRefreshTokenError';
  }
}
