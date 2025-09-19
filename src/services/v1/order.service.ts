import { PrismaClient, OrderStatus, State } from '@prisma/client';
import { OrderRepository } from '../../repositories/v1/order.repository';
import { IOrderCreate, IOrderService, IOrderUpdate } from '../../interfaces/v1/IOrder';

export class OrderService implements IOrderService {
  constructor(private repo: OrderRepository, private prisma: PrismaClient) {}

  async list(date: string) {
    const searchDate = new Date(date);
    return this.repo.findByDate(searchDate).then((orders) =>
      orders.map((o: any) => ({
        ...o,
        quantity: o.orderProduct.reduce((acc: number, op: any) => (op.state !== 'INACTIVE' ? acc + op.quantity : acc), 0),
      }))
    );
  }

  async addOrder(data: IOrderCreate) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          clientId: Number(data.client.id),
          date: new Date(data.date),
          userAt: Number(data.userAt),
          orderProduct: {
            createMany: {
              data: data.orderProduct.map((op) => ({
                productId: Number(op.product.id),
                quantity: Number(op.quantity),
                aditional: Boolean(op.aditional),
                unitPrice: (op.product as any).price, // Decimal-compatible
                userAt: Number(data.userAt),
              })),
            },
          },
        },
      });

      if (data.delivery?.driver?.id) {
        await tx.delivery.create({
          data: { orderId: order.id, driverId: Number(data.delivery.driver.id), userAt: Number(data.userAt) },
        });
      }

      return order;
    });
  }

  async modifyOrder(data: IOrderUpdate) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: Number(data.id) },
        data: {
          ...(data.clientId !== undefined && { clientId: Number(data.clientId) }),
          ...(data.date !== undefined && { date: new Date(data.date) }),
          ...(data.state !== undefined && { state: data.state as OrderStatus }),
          ...(data.userAt !== undefined && { userAt: Number(data.userAt) }),
        },
      });

      if (Array.isArray(data.orderProduct)) {
        await Promise.all(
          data.orderProduct.map(async (op) => {
            if (op.id) {
              await tx.orderProduct.update({
                where: { id: Number(op.id) },
                data: {
                  productId: Number(op.product.id),
                  quantity: Number(op.quantity),
                  aditional: Boolean(op.aditional),
                  unitPrice: (op.product as any).price,
                  state: (op.state as State) ?? 'ACTIVE',
                  userAt: Number(data.userAt),
                },
              });
            } else {
              await tx.orderProduct.create({
                data: {
                  productId: Number(op.product.id),
                  orderId: order.id,
                  quantity: Number(op.quantity),
                  aditional: Boolean(op.aditional),
                  unitPrice: (op.product as any).price,
                  userAt: Number(data.userAt),
                },
              });
            }
          })
        );
      }

      if (data.delivery?.driver?.id) {
        if (data.delivery.id) {
          await tx.delivery.update({
            where: { id: Number(data.delivery.id) },
            data: {
              driverId: Number(data.delivery.driver.id),
              status: data.delivery.status,
              userAt: Number(data.userAt),
            },
          });
        } else {
          await tx.delivery.create({
            data: { orderId: order.id, driverId: Number(data.delivery.driver.id), userAt: Number(data.userAt) },
          });
        }
      }

      return order;
    });
  }

  async removeOrder(id: number) {
    return this.repo.cancel(Number(id));
  }

  async total(date: string) {
    const searchDate = new Date(date);
    const totals = await this.repo.totalsForDate(searchDate);
    const products = await this.repo.activeProducts();

    return products.map((p: any) => ({
      ...p,
      total: totals.find((t) => t.productId === p.id)?._sum.quantity || 0,
    }));
  }
}