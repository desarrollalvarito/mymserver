import { PrismaClient, OrderStatus, State } from '@prisma/client';
import { OrderRepository } from '../../repositories/v1/order.repository.js';
import { IOrderCreate, IOrderService, IOrderUpdate } from '../../interfaces/v1/IOrder.js';

export class OrderService implements IOrderService {
  constructor(private repo: OrderRepository, private prisma: PrismaClient) {}

  async list(date: string) {
    const searchDate = new Date(date);
    return this.repo.findByDate(searchDate).then((orders) =>
      orders.map((o: any) => ({
        ...o,
        // Sum quantities excluding INACTIVE items
        quantity: o.orderProduct.reduce((acc: number, op: any) => (op.state !== State.INACTIVE ? acc + op.quantity : acc), 0),
      }))
    );
  }

  async addOrder(data: IOrderCreate) {
    return this.prisma.$transaction(async (tx) => {
      // Basic validations
      if (!data?.client?.id) throw new Error('client.id requerido');
      const orderDate = new Date(data.date as any);
      if (isNaN(orderDate.getTime())) throw new Error('date inválida');
      if (!Array.isArray(data.orderProduct) || data.orderProduct.length === 0) throw new Error('orderProduct vacío');
      if (data.orderProduct.some((op) => Number(op.quantity) <= 0)) throw new Error('quantity debe ser > 0');

      // Fetch product prices from DB (ACTIVE only)
      const productIds = [...new Set(data.orderProduct.map((op) => Number(op.product.id)))];
      const dbProducts = await this.repo.findActiveProductsByIds(productIds, tx);
      const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));
      if (productIds.some((id) => !priceMap.has(id))) throw new Error('Producto inexistente o INACTIVE en orderProduct');

      const order = await this.repo.create(
        {
          clientId: Number(data.client.id),
          date: orderDate,
          userAt: Number(data.userAt),
          orderProduct: {
            createMany: {
              data: data.orderProduct.map((op) => ({
                productId: Number(op.product.id),
                quantity: Number(op.quantity),
                unitPrice: priceMap.get(Number(op.product.id))!,
                userAt: Number(data.userAt),
              })),
            },
          },
        } as any,
        tx
      );

      if (data.delivery?.driver?.id) {
        await this.repo.createDelivery(
          { orderId: order.id, driverId: Number(data.delivery.driver.id), userAt: Number(data.userAt) } as any,
          tx
        );
      }

      return order;
    });
  }

  async modifyOrder(data: IOrderUpdate) {
    return this.prisma.$transaction(async (tx) => {
      // Basic validations
      const orderDate = data.date !== undefined ? new Date(data.date as any) : undefined;
      if (orderDate && isNaN(orderDate.getTime())) throw new Error('date inválida');

      const order = await this.repo.update(
        Number(data.id),
        {
          ...(data.clientId !== undefined && { clientId: Number(data.clientId) }),
          ...(orderDate !== undefined && { date: orderDate }),
          ...(data.state !== undefined && { state: data.state as OrderStatus }),
          ...(data.userAt !== undefined && { userAt: Number(data.userAt) }),
        },
        tx
      );

      if (Array.isArray(data.orderProduct)) {
        // Determine prices from DB for ACTIVE products
        const productIds = [...new Set(data.orderProduct.map((op) => Number(op.product.id)))];
        const dbProducts = await this.repo.findActiveProductsByIds(productIds, tx);
        const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

        await Promise.all(
          data.orderProduct.map(async (op) => {
            const baseData: any = {
              productId: Number(op.product.id),
              quantity: Number(op.quantity),
              userAt: Number(data.userAt),
            };

            if (op.id !== undefined && op.id > 0) {
              // Preserve unitPrice unless productId changes
              const existing = await this.repo.findOrderProductProductId(Number(op.id), tx);
              if (!existing) throw new Error(`orderProduct ${op.id} no existe`);
              if (existing.productId !== Number(op.product.id)) {
                const price = priceMap.get(Number(op.product.id));
                if (price === undefined) throw new Error('Producto inexistente o INACTIVE en modifyOrder');
                baseData.unitPrice = price;
              }
              baseData.state = (op.state as State) ?? State.ACTIVE;

              await this.repo.updateOrderProduct(Number(op.id), baseData, tx);
            } else {
              const price = priceMap.get(Number(op.product.id));
              if (price === undefined) throw new Error('Producto inexistente o INACTIVE en modifyOrder');
              await this.repo.createOrderProduct(
                {
                  ...baseData,
                  orderId: order.id,
                  unitPrice: price,
                } as any,
                tx
              );
            }
          })
        );
      }

      if (data.delivery?.driver?.id) {
        if (data.delivery?.id !== undefined && data.delivery.id > 0) {
          await this.repo.updateDelivery(
            Number(data.delivery.id),
            {
              driverId: Number(data.delivery.driver.id),
              status: data.delivery.status,
              userAt: Number(data.userAt),
            } as any,
            tx
          );
        } else {
          await this.repo.createDelivery(
            { data: { orderId: order.id, driverId: Number(data.delivery.driver.id), userAt: Number(data.userAt) } } as any,
            tx
          );
        }
      }

      return order;
    });
  }

  async removeOrder(id: number) {
    const exists = await this.repo.exists(Number(id));
    if (!exists) throw new Error('Orden no encontrada');
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