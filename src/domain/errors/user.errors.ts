export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials.');
    this.name = 'InvalidCredentialsError';
  }
}

export class DuplicateUserError extends Error {
  constructor() {
    super('User with this email already exists.');
    this.name = 'DuplicateUserError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.');
    this.name = 'UserNotFoundError';
  }
}
