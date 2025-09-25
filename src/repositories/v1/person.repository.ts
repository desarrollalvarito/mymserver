import { PrismaClient } from '@prisma/client';
import { IPerson, IPersonCreate, IPersonUpdate } from '../../interfaces/v1/IPerson.js';

export class PersonRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<IPerson[]> {
    return this.prisma.person.findMany({ orderBy: { id: 'desc' } });
  }

  async findById(id: number): Promise<IPerson | null> {
    return this.prisma.person.findUnique({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const item = await this.prisma.person.findUnique({ where: { id }, select: { id: true } });
    return !!item;
  }

  async findByRun(run: string): Promise<IPerson | null> {
    return this.prisma.person.findUnique({ where: { run } });
  }

  async create(data: IPersonCreate): Promise<IPerson> {
    return this.prisma.person.create({ data: data as any });
  }

  async update(personData: IPersonUpdate): Promise<IPerson> {
    const { id, ...data } = personData;
    return this.prisma.person.update({ where: { id }, data: data as any });
  }

  async delete(id: number): Promise<IPerson> {
    return this.prisma.person.delete({ where: { id } });
  }
}