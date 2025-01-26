import { CreateUserDTO, User } from '../types/user';

class UserService {
  private users: User[] = [];

  async createUser(user: CreateUserDTO): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(),
      ...user,
      createdAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }
}

export default UserService;
