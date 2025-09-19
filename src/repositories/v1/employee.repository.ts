import { PrismaClient, State } from '@prisma/client';
import { IEmployee, IEmployeeCreate, IEmployeeUpdate } from '../../interfaces/v1/IEmployee';

export class EmployeeRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<IEmployee[]> {
    return this.prisma.employee.findMany({ include: { person: true },where: { state: State.ACTIVE }, orderBy: { id: 'desc' } });
  }

  async findById(id: number): Promise<IEmployee | null> {
    return this.prisma.employee.findUnique({ where: { id }, include: { person: true } });
  }

  async exists(id: number): Promise<boolean> {
    const item = await this.prisma.employee.findUnique({ where: { id }, select: { id: true } });
    return !!item;
  }

  async create(data: IEmployeeCreate): Promise<IEmployee> {
    return this.prisma.employee.create({ data });
  }

  async update({ id, ...data }: IEmployeeUpdate): Promise<IEmployee> {
    return this.prisma.employee.update({ where: { id }, data });
  }

  async delete(id: number): Promise<IEmployee> {
    return this.prisma.employee.update({ where: { id }, data: { state: State.INACTIVE } });
  }
}