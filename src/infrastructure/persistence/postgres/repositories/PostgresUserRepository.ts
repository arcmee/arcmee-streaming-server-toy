import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // This is a mock implementation.
    // In a real scenario, you would query the PostgreSQL database.
    console.log(`Searching for user with id: ${id} in PostgreSQL...`);
    if (id === '1') {
      return new User('1', 'testuser', 'test@example.com');
    }
    return null;
  }
}
