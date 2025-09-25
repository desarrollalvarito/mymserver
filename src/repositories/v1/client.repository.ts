import { PrismaClient } from '@prisma/client';
import { IClient, IClientCreate, IClientUpdate } from '../../interfaces/v1/IClient.js';

export class ClientRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<IClient[]> {
    return this.prisma.client.findMany({
      include: { person: true },
      orderBy: { id: 'desc' }
    });
  }

  async findById(id: number): Promise<IClient | null> {
    return this.prisma.client.findUnique({ where: { id }, include: { person: true } });
  }

  async exists(id: number): Promise<boolean> {
    const client = await this.prisma.client.findUnique({ where: { id }, select: { id: true } });
    return !!client;
  }

  async create(data: IClientCreate): Promise<IClient> {
    return this.prisma.client.create({ data });
  }

  async update({ id, ...data }: IClientUpdate): Promise<IClient> {
    return this.prisma.client.update({ where: { id }, data });
  }

  async delete(id: number): Promise<IClient> {
    return this.prisma.client.delete({ where: { id } });
  }
}