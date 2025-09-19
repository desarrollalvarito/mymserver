import { PrismaClient } from '@prisma/client';

export class ProductionRepository {
  constructor(private prisma: PrismaClient) {}

  findByDate(date: Date) {
    return this.prisma.production.findMany({
      where: { date: { equals: date } },
      select: {
        id: true,
        date: true,
        cook: {
          select: {
            id: true,
            workShift: true,
            person: { select: { id: true, run: true, names: true, lastName: true, gender: true } },
          },
        },
        status: true,
        userAt: true,
        productionProduct: {
          select: {
            id: true,
            quantity: true,
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: any) {
    return this.prisma.production.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.production.update({ where: { id }, data });
  }

  cancel(id: number) {
    return this.prisma.production.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  createProductionProduct(data: any) {
    return this.prisma.productionProduct.create({ data });
  }

  updateProductionProduct(id: number, data: any) {
    return this.prisma.productionProduct.update({ where: { id }, data });
  }

  groupProductionsByProduct(date: Date) {
    return this.prisma.productionProduct.groupBy({
      where: { production: { date: { equals: date }, AND: { status: { not: 'CANCELLED' } } } },
      by: ['productId'],
      _sum: { quantity: true },
    });
  }

  groupOrdersByProduct(date: Date) {
    return this.prisma.orderProduct.groupBy({
      where: { order: { date: { equals: date }, AND: { state: { not: 'CANCELLED' } } }, state: 'ACTIVE' },
      by: ['productId'],
      _sum: { quantity: true },
    });
  }

  activeProducts() {
    return this.prisma.product.findMany({ where: { state: 'ACTIVE' }, select: { id: true, name: true } });
  }

  countOrders(where: any) {
    return this.prisma.order.count({ where });
  }

  sumOrderProducts(where: any) {
    return this.prisma.orderProduct.aggregate({ where, _sum: { quantity: true } });
  }

  sumProductionProducts(where: any) {
    return this.prisma.productionProduct.aggregate({ where, _sum: { quantity: true } });
  }
}