import { PrismaClient, ProductionStatus } from '@prisma/client';
import { ProductionRepository } from '../../repositories/v1/production.repository';
import { IProductionCreate, IProductionService, IProductionUpdate } from '../../interfaces/v1/IProduction';

export class ProductionService implements IProductionService {
  constructor(private repo: ProductionRepository, private prisma: PrismaClient) {}

  list(date: string) {
    return this.repo.findByDate(new Date(date));
  }

  add(data: IProductionCreate) {
    return this.prisma.$transaction(async (tx) => {
      const production = await tx.production.create({
        data: {
          date: new Date(data.date),
          assignedTo: Number(data.cook.id),
          userAt: Number(data.userAt),
          productionProduct: {
            createMany: {
              data: data.productionProduct.map((pp) => ({
                productId: Number(pp.product.id),
                quantity: Number(pp.quantity),
                userAt: Number(data.userAt),
              })),
            },
          },
        },
      });
      return production;
    });
  }

  async modify(data: IProductionUpdate) {
    return this.prisma.$transaction(async (tx) => {
      const production = await tx.production.update({
        where: { id: Number(data.id) },
        data: {
          ...(data.date !== undefined && { date: new Date(data.date) }),
          ...(data.cook?.id !== undefined && { assignedTo: Number(data.cook.id) }),
          ...(data.status !== undefined && { status: data.status as ProductionStatus }),
          ...(data.userAt !== undefined && { userAt: Number(data.userAt) }),
        },
      });

      if (Array.isArray(data.productionProduct)) {
        await Promise.all(
          data.productionProduct.map(async (pp) => {
            if (pp.id) {
              await tx.productionProduct.update({
                where: { id: Number(pp.id) },
                data: {
                  productId: Number(pp.product.id),
                  quantity: Number(pp.quantity),
                  userAt: Number(data.userAt),
                },
              });
            } else {
              await tx.productionProduct.create({
                data: {
                  productionId: production.id,
                  productId: Number(pp.product.id),
                  quantity: Number(pp.quantity),
                  userAt: Number(data.userAt),
                },
              });
            }
          })
        );
      }

      return production;
    });
  }

  remove(id: number) {
    return this.repo.cancel(Number(id));
  }

  async ordersProductions(date: string) {
    const when = new Date(date);
    const productions = await this.repo.groupProductionsByProduct(when);
    const orders = await this.repo.groupOrdersByProduct(when);
    const products = await this.repo.activeProducts();

    return products.map((p: any) => ({
      ...p,
      productions: productions.find((x) => x.productId === p.id)?._sum.quantity || 0,
      orders: orders.find((x) => x.productId === p.id)?._sum.quantity || 0,
    }));
  }

  async metrics(date?: string) {
    const whereClause = date
      ? {
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lte: new Date(date + 'T23:59:59.999Z'),
          },
        }
      : {};

    const totalOrdenes = await this.repo.countOrders({
      ...(whereClause as any),
      state: { not: 'CANCELLED' },
    });

    const totalProductosSolicitados = await this.repo.sumOrderProducts({
      order: { ...(whereClause as any), state: { not: 'CANCELLED' } },
      state: 'ACTIVE',
    });

    const totalProductosProgramados = await this.repo.sumProductionProducts({
      production: { ...(whereClause as any), status: 'PENDING' },
    });

    const totalProductosEnProceso = await this.repo.sumProductionProducts({
      production: { ...(whereClause as any), status: 'IN_PROGRESS' },
    });

    const totalProductos = totalProductosSolicitados._sum.quantity || 0;
    const produccionProgramada = totalProductosProgramados._sum.quantity || 0;
    const produccionEnProceso = totalProductosEnProceso._sum.quantity || 0;

    return {
      totalOrdenes,
      totalProductos,
      produccionProgramada,
      produccionEnProceso,
      productosDisponibles: totalProductos - (produccionProgramada + produccionEnProceso),
    };
  }
}