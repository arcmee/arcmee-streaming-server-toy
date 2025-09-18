import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '@src/domain/entities/user.entity';
import { IUserRepository } from '@src/domain/repositories/IUserRepository';

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(user: PrismaUser): User {
    return new User({ ...user });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByStreamKey(streamKey: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { streamKey } });
    return user ? this.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    const { id, ...userData } = user;
    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        id: id,
      },
    });
    return this.toDomain(newUser);
  }
}