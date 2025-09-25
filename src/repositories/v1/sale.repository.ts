import { PrismaClient, PaymentStatus, State, Prisma } from "@prisma/client";

export class SaleRepository {
  constructor(private prisma: PrismaClient) {}

  async findByDate(date: Date) {
    return this.prisma.sale.findMany({
      where: { date: { equals: date } },
      select: {
        id: true,
        date: true,
        discount: true,
        totalAmount: true,
        paymentStatus: true,
        userAt: true,
        createdAt: true,
        payments: {
          select: { paymentMethod: true }
        },
        saleItems: {
          where: { product: { state: State.ACTIVE } },
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findById(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        discount: true,
        totalAmount: true,
        paymentStatus: true,
        userAt: true,
        createdAt: true,
        payments: {
          select: { paymentMethod: true, amount: true }
        },
        saleItems: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true
              }
            }
          }
        }
      }
    });
  }

  async create(data: Prisma.SaleCreateInput) {
    return this.prisma.sale.create({ data });
  }

  async update(id: number, data: Prisma.SaleUpdateInput) {
    return this.prisma.sale.update({ where: { id }, data });
  }

  async cancel(id: number) {
    return this.prisma.sale.update({
      where: { id },
      data: { paymentStatus: PaymentStatus.CANCELLED }
    });
  }

  async createSaleItem(data: Prisma.SaleItemCreateInput) {
    return this.prisma.saleItem.create({ data });
  }

  async updateSaleItem(id: number, data: Prisma.SaleItemUpdateInput) {
    return this.prisma.saleItem.update({ where: { id }, data });
  }

  async deleteSaleItem(id: number) {
    return this.prisma.saleItem.delete({ where: { id } });
  }

  async getSalesStats(startDate: Date, endDate: Date) {
    // Estadísticas generales
    const stats = await this.prisma.sale.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        paymentStatus: {
          not: PaymentStatus.CANCELLED
        }
      },
      _count: { id: true },
      _sum: {
        discount: true,
        totalAmount: true
      }
    });

    // Ventas por método de pago (derivado de payments)
    const salesByPaymentMethod = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        sale: {
          date: { gte: startDate, lte: endDate },
          paymentStatus: { not: PaymentStatus.CANCELLED }
        }
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    // Productos más vendidos
    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          date: {
            gte: startDate,
            lte: endDate
          },
          paymentStatus: {
            not: PaymentStatus.CANCELLED
          }
        }
      },
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Obtener información de productos
    const productDetails = await this.prisma.product.findMany({
      where: {
        id: { in: topProducts.map(p => p.productId) },
        state: State.ACTIVE
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });

    const topProductsWithDetails = topProducts.map(item => {
      const product = productDetails.find(p => p.id === item.productId);
      return {
        product,
        totalQuantity: item._sum.quantity
      };
    });

    return {
      totalSales: stats._count?.id ?? 0,
      totalRevenue: stats._sum?.totalAmount ?? 0,
      totalDiscount: stats._sum?.discount ?? 0,
      averageSale: (stats._count?.id ?? 0) > 0 ? Number(stats._sum?.totalAmount ?? 0) / (stats._count?.id ?? 1) : 0,
      salesByPaymentMethod,
      topProducts: topProductsWithDetails
    };
  }

  async checkStock(productId: number, quantity: number): Promise<boolean> {
    const stock = await this.prisma.stock.findUnique({
      where: { productId },
      select: { currentAmount: true }
    });

    return stock ? stock.currentAmount >= quantity : false;
  }

  async updateStock(productId: number, quantity: number, operation: 'increment' | 'decrement') {
    const amount = operation === 'decrement' ? -quantity : quantity;
    
    return this.prisma.stock.update({
      where: { productId },
      data: {
        currentAmount: {
          increment: amount
        }
      }
    });
  }
}