import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class PostgresUserRepository implements IUserRepository {
  private users: User[] = [
    new User('1', 'testuser', 'test@example.com', 'hashed_password_here', 'stream_key_here')
  ];

  async findById(id: string): Promise<User | null> {
    console.log(`Searching for user with id: ${id} in PostgreSQL...`);
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log(`Searching for user with email: ${email} in PostgreSQL...`);
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async create(user: User): Promise<User> {
    console.log(`Creating user with email: ${user.email} in PostgreSQL...`);
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password!, salt);
    user.streamKey = Math.random().toString(36).substring(7); // Generate a random stream key
    const newUser = new User(
        (this.users.length + 1).toString(),
        user.username,
        user.email,
        user.password,
        user.streamKey
    );
    this.users.push(newUser);
    return newUser;
  }
}
