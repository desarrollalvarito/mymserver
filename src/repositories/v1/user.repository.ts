import { PrismaClient } from '@prisma/client';
import { IUser, IUserSession, IUserCreate, IUserUpdate } from '../../interfaces/v1/IUser';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<IUser[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: number): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findUserWithPerson(username: string): Promise<IUserSession | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        person: {
          select: {
            id: true,
            run: true,
            names: true,
            lastName: true,
            employee: {
              select: {
                jobRole: true,
                workShift: true
              }
            }
          }
        }
      }
    });
  }

  async create(userData: IUserCreate): Promise<IUser> {
    return this.prisma.user.create({
      data: userData
    });
  }

  async update(userData: IUserUpdate): Promise<IUser> {
    const { id, ...data } = userData;
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async validateCredentials(username: string): Promise<{ id: number; username: string; email: string | null; password: string } | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true
      }
    });
  }
}