import { User } from "@src/domain/entities/user.entity";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";

export class FakeUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findByStreamKey(streamKey: string): Promise<User | null> {
    return this.users.find(user => user.streamKey === streamKey) || null;
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async save(user: User): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      this.users[userIndex] = user;
    }
    return user;
  }
}
