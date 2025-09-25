import { PrismaClient, ProductionStatus, OrderStatus, State } from '@prisma/client';
import { ProductionRepository } from '../../repositories/v1/production.repository.js';
import { IProductionCreate, IProductionService, IProductionUpdate } from '../../interfaces/v1/IProduction.js';

export class ProductionService implements IProductionService {
  constructor(private repo: ProductionRepository, private prisma: PrismaClient) {}

  list(date: string) {
    return this.repo.findByDate(new Date(date));
  }

  add(data: IProductionCreate) {
    return this.prisma.$transaction(async (tx) => {
      // Validaciones básicas
      if (!data?.cook?.id) throw new Error('cook.id requerido');
      const prodDate = new Date(data.date as any);
      if (isNaN(prodDate.getTime())) throw new Error('date inválida');
      if (!Array.isArray(data.productionProduct) || data.productionProduct.length === 0) throw new Error('productionProduct vacío');
      if (data.productionProduct.some((pp) => Number(pp.quantity) <= 0)) throw new Error('quantity debe ser > 0');

      // Validar productos ACTIVE
      const productIds = [...new Set(data.productionProduct.map((pp) => Number(pp.product.id)))];
      const dbProducts = await tx.product.findMany({ where: { id: { in: productIds }, state: 'ACTIVE' as any }, select: { id: true } });
      const ok = new Set(dbProducts.map((p) => p.id));
      if (productIds.some((id) => !ok.has(id))) throw new Error('Producto inexistente o INACTIVE en productionProduct');

      const production = await tx.production.create({
        data: {
          date: prodDate,
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
      // Validaciones
      const prodDate = data.date !== undefined ? new Date(data.date as any) : undefined;
      if (prodDate && isNaN(prodDate.getTime())) throw new Error('date inválida');

      const production = await tx.production.update({
        where: { id: Number(data.id) },
        data: {
          ...(prodDate !== undefined && { date: prodDate }),
          ...(data.cook?.id !== undefined && { assignedTo: Number(data.cook.id) }),
          ...(data.status !== undefined && { status: data.status as ProductionStatus }),
          ...(data.userAt !== undefined && { userAt: Number(data.userAt) }),
        },
      });

      if (Array.isArray(data.productionProduct)) {
        // Validar productos ACTIVE
        const productIds = [...new Set(data.productionProduct.map((pp) => Number(pp.product.id)))];
        const dbProducts = await tx.product.findMany({ where: { id: { in: productIds }, state: 'ACTIVE' as any }, select: { id: true } });
        const ok = new Set(dbProducts.map((p) => p.id));
        if (productIds.some((id) => !ok.has(id))) throw new Error('Producto inexistente o INACTIVE en productionProduct');

        await Promise.all(
          data.productionProduct.map(async (pp) => {
            const baseData = {
              productId: Number(pp.product.id),
              quantity: Number(pp.quantity),
              userAt: Number(data.userAt),
            };

            if (pp.id) {
              await tx.productionProduct.update({ where: { id: Number(pp.id) }, data: baseData });
            } else {
              await tx.productionProduct.create({
                data: {
                  ...baseData,
                  productionId: production.id,
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
      state: { not: 'CANCELLED' as any },
    });

    const totalProductosSolicitados = await this.repo.sumOrderProducts({
      order: { ...(whereClause as any), state: { not: 'CANCELLED' as any } },
      state: 'ACTIVE' as any,
    });

    const totalProductosProgramados = await this.repo.sumProductionProducts({
      production: { ...(whereClause as any), status: 'PENDING' as any },
    });

    const totalProductosEnProceso = await this.repo.sumProductionProducts({
      production: { ...(whereClause as any), status: 'IN_PROGRESS' as any },
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