import { PrismaClient, OrderStatus, State } from '@prisma/client';

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findByDate(date: Date) {
    return this.prisma.order.findMany({
      where: { date: { equals: date } },
      select: {
        id: true,
        date: true,
        state: true,
        userAt: true,
        client: true,
        orderProduct: {
          select: {
            id: true,
            quantity: true,
            aditional: true,
            state: true,
            product: { select: { id: true, name: true, price: true } },
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            driver: {
              select: { id: true, person: { select: { id: true, run: true, names: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.order.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.order.update({ where: { id }, data });
  }

  async cancel(id: number) {
    return this.prisma.order.update({ where: { id }, data: { state: 'CANCELLED' } });
  }

  async createDelivery(data: any) {
    return this.prisma.delivery.create({ data });
  }

  async updateDelivery(id: number, data: any) {
    return this.prisma.delivery.update({ where: { id }, data });
  }

  async createOrderProduct(data: any) {
    return this.prisma.orderProduct.create({ data });
  }

  async updateOrderProduct(id: number, data: any) {
    return this.prisma.orderProduct.update({ where: { id }, data });
  }

  async totalsForDate(date: Date) {
    return this.prisma.orderProduct.groupBy({
      where: { order: { date: { equals: date }, AND: { state: { not: 'CANCELLED' } } }, state: 'ACTIVE' },
      by: ['productId'],
      _sum: { quantity: true },
    });
  }

  async activeProducts() {
    return this.prisma.product.findMany({ where: { state: 'ACTIVE' }, select: { id: true, name: true, price: true } });
  }
}