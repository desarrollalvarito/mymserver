import { PrismaClient, PaymentStatus } from '@prisma/client';
import { SaleRepository } from '../../repositories/v1/sale.repository.js';
import { ISaleCreate, ISaleService, ISaleUpdate } from '../../interfaces/v1/ISale.js';

export class SaleService implements ISaleService {
  constructor(private repo: SaleRepository, private prisma: PrismaClient) {}

  async list(date: string) {
    const searchDate = new Date(date);
    return this.repo.findByDate(searchDate);
  }

  async getById(id: number) {
    return this.repo.findById(id);
  }

  async createSale(data: ISaleCreate) {
    return this.prisma.$transaction(async (tx) => {
      // Validar stock antes de crear la venta
      for (const item of data.saleItems) {
        const hasStock = await this.repo.checkStock(item.productId, item.quantity);
        if (!hasStock) {
          throw new Error(`Stock insuficiente para el producto ID: ${item.productId}`);
        }
      }

      // Crear la venta base sin campos inexistentes
      const sale = await tx.sale.create({
        data: {
          orderId: Number(data.orderId),
          date: new Date(data.date as any),
          subtotal: 0,
          discount: Number(data.discount ?? 0),
          tax: 0,
          totalAmount: Number(data.totalAmount),
          amountPaid: 0,
          balance: 0,
          paymentStatus: data.paymentStatus ?? PaymentStatus.PAID,
          userAt: Number(data.userAt)
        }
      });

      let subtotal = 0;

      // Crear items de venta y actualizar stock
      for (const item of data.saleItems) {
        const unit = Number(item.unitPrice);
        const totalPrice = unit * Number(item.quantity);
        subtotal += totalPrice;
        
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            unitPrice: unit,
            totalPrice: totalPrice,
            userAt: Number(data.userAt)
          }
        });

        // Actualizar stock
        await tx.stock.update({
          where: { productId: Number(item.productId) },
          data: {
            currentAmount: {
              decrement: Number(item.quantity)
            }
          }
        });
      }

      // Crear un pago asociado si viene paymentMethod
      if (data.paymentMethod) {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            amount: Number(data.totalAmount),
            paymentMethod: data.paymentMethod,
            status: data.paymentStatus ?? PaymentStatus.PAID,
            userAt: Number(data.userAt)
          }
        });
      }

      // Actualizar totales calculados
      const tax = 0; // Ajustar si aplica
      const amountPaid = data.paymentStatus === PaymentStatus.PAID ? Number(data.totalAmount) : 0;
      const balance = Number(data.totalAmount) - amountPaid;

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          subtotal,
          tax,
          amountPaid,
          balance
        }
      });

      return this.repo.findById(sale.id);
    });
  }

  async updateSale(data: ISaleUpdate) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.update({
        where: { id: Number(data.id) },
        data: {
          ...(data.date !== undefined && { date: new Date(data.date as any) }),
          ...(data.discount !== undefined && { discount: Number(data.discount) }),
          ...(data.totalAmount !== undefined && { totalAmount: Number(data.totalAmount) }),
          ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
          ...(data.userAt !== undefined && { userAt: Number(data.userAt) })
        }
      });

      // Opcional: actualizar pagos si cambia el total
      if (data.totalAmount !== undefined) {
        await tx.payment.updateMany({
          where: { saleId: sale.id },
          data: { amount: Number(data.totalAmount) }
        });
      }

      return this.repo.findById(sale.id);
    });
  }

  async cancelSale(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // Obtener la venta y sus items
      const sale = await this.repo.findById(Number(id));
      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      if (sale.paymentStatus === PaymentStatus.CANCELLED) {
        throw new Error('La venta ya está cancelada');
      }

      // Revertir stock
      for (const item of sale.saleItems) {
        await tx.stock.update({
          where: { productId: item.product.id },
          data: {
            currentAmount: {
              increment: item.quantity
            }
          }
        });
      }

      // Cancelar venta
      return this.repo.cancel(Number(id));
    });
  }

  async getSalesStats(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ajustar fechas para incluir todo el día
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.repo.getSalesStats(start, end);
  }
}