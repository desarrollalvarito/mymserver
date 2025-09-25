import { PrismaClient, OrderStatus, State, Prisma } from "@prisma/client";

export class OrderRepository {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Choose transactional client when provided
  private db(client?: Prisma.TransactionClient) {
    return (client ?? this.prisma) as Prisma.TransactionClient & PrismaClient;
  }

  async exists(id: number, client?: Prisma.TransactionClient): Promise<boolean> {
    const order = await this.db(client).order.findUnique({ where: { id }, select: { id: true } });
    return !!order;
  }

  async findByDate(date: Date, client?: Prisma.TransactionClient) {
    return this.db(client).order.findMany({
      where: { date: { equals: date } },
      select: {
        id: true,
        date: true,
        state: true,
        userAt: true,
        client: {
          select: {
            id: true,
            rut: true,
            shippingAddress: true,
            billName: true,
            person: {
              select: {
                id: true,
                run: true,
                names: true,
                lastName: true,
                contact: true,
              },
            },
          },
        },
        orderProduct: {
          select: {
            id: true,
            quantity: true,
            state: true,
            product: { select: { id: true, name: true, price: true } },
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            driver: {
              select: {
                id: true,
                workShift: true,
                person: {
                  select: { id: true, run: true, names: true, lastName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: Prisma.OrderCreateArgs['data'], client?: Prisma.TransactionClient) {
    return this.db(client).order.create({ data });
  }

  async update(id: number, data: Prisma.OrderUpdateArgs['data'], client?: Prisma.TransactionClient) {
    return this.db(client).order.update({ where: { id }, data });
  }

  async cancel(id: number, client?: Prisma.TransactionClient) {
    return this.db(client).order.update({
      where: { id },
      data: { state: OrderStatus.CANCELLED },
    });
  }

  async createDelivery(data: Prisma.DeliveryUncheckedCreateInput, client?: Prisma.TransactionClient) {
    return this.db(client).delivery.create({ data });
  }

  async updateDelivery(id: number, data: Prisma.DeliveryUncheckedUpdateInput, client?: Prisma.TransactionClient) {
    return this.db(client).delivery.update({ where: { id }, data });
  }

  async createOrderProduct(data: Prisma.OrderProductUncheckedCreateInput, client?: Prisma.TransactionClient) {
    return this.db(client).orderProduct.create({ data });
  }

  async updateOrderProduct(id: number, data: Prisma.OrderProductUncheckedUpdateInput, client?: Prisma.TransactionClient) {
    return this.db(client).orderProduct.update({ where: { id }, data });
  }

  async totalsForDate(date: Date, client?: Prisma.TransactionClient) {
    return this.db(client).orderProduct.groupBy({
      where: {
        order: { date: { equals: date }, AND: { state: { not: OrderStatus.CANCELLED } } },
        state: State.ACTIVE,
      },
      by: ["productId"],
      _sum: { quantity: true },
    });
  }

  async activeProducts(client?: Prisma.TransactionClient) {
    return this.db(client).product.findMany({
      where: { state: State.ACTIVE },
      select: { id: true, name: true, price: true },
    });
  }

  // Helpers for service logic
  async findActiveProductsByIds(ids: number[], client?: Prisma.TransactionClient) {
    if (ids.length === 0) return [];
    return this.db(client).product.findMany({
      where: { id: { in: ids }, state: State.ACTIVE },
      select: { id: true, price: true },
    });
  }

  async findOrderProductProductId(id: number, client?: Prisma.TransactionClient) {
    return this.db(client).orderProduct.findUnique({ where: { id }, select: { productId: true } });
  }
}