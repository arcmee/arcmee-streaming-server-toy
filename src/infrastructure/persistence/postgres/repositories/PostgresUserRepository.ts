import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';
import { prisma } from '../client';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? new User(user) : null;
  }

  async findByStreamKey(streamKey: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { streamKey } });
    return user ? new User(user) : null;
  }

  async create(user: User): Promise<User> {
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        streamKey: user.streamKey,
      },
    });
    return new User(newUser);
  }
}