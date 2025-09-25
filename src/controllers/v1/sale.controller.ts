import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../../lib/database.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

type ValidationChain = ReturnType<typeof body>;
import { SaleRepository } from '../../repositories/v1/sale.repository.js';
import { SaleService } from '../../services/v1/sale.service.js';
import { ISaleCreate, ISaleUpdate } from '../../interfaces/v1/ISale.js';

const saleRepository = new SaleRepository(prisma);
const saleService = new SaleService(saleRepository, prisma);

export class SaleController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date: string };
      const data = await saleService.list(date);
      return res.json({ success: true, data, count: data.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = await saleService.getById(Number(id));
      if (!data) {
        return res.status(404).json({ success: false, error: 'Venta no encontrada' });
      }
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as ISaleCreate;
      const created = await saleService.createSale(payload);
      return res.status(201).json({ 
        success: true, 
        message: 'Venta creada exitosamente', 
        data: created 
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as ISaleUpdate;
      const updated = await saleService.updateSale(payload);
      return res.json({ 
        success: true, 
        message: 'Venta actualizada exitosamente', 
        data: updated 
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cancelled = await saleService.cancelSale(Number(id));
      return res.json({ 
        success: true, 
        message: 'Venta cancelada exitosamente', 
        data: cancelled 
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async stats(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await saleService.getSalesStats(startDate, endDate);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static validate(method: string): ValidationChain[] {
    switch (method) {
      case 'list':
        return [
          body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido')
        ];
      
      case 'create':
        return [
          body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido'),
          body('partialAmount').exists().withMessage('partialAmount es requerido').isNumeric().withMessage('partialAmount debe ser numérico'),
          body('discount').optional().isNumeric().withMessage('discount debe ser numérico'),
          body('totalAmount').exists().withMessage('totalAmount es requerido').isNumeric().withMessage('totalAmount debe ser numérico'),
          body('paymentMethod').exists().withMessage('paymentMethod es requerido').isIn(Object.values(PaymentMethod)),
          body('paymentStatus').optional().isIn(Object.values(PaymentStatus)),
          body('userAt').exists().withMessage('userAt es requerido').isInt({ min: 1 }),
          body('saleItems').isArray({ min: 1 }).withMessage('saleItems debe tener al menos 1 item'),
          body('saleItems.*.productId').exists().withMessage('productId es requerido').isInt({ min: 1 }),
          body('saleItems.*.quantity').exists().withMessage('quantity es requerido').isInt({ min: 1 }),
          body('saleItems.*.unitPrice').exists().withMessage('unitPrice es requerido').isNumeric().withMessage('unitPrice debe ser numérico')
        ];
      
      case 'update':
        return [
          body('id').exists().withMessage('id es requerido').isInt({ min: 1 }),
          body('date').optional().isISO8601().withMessage('date inválido'),
          body('partialAmount').optional().isNumeric().withMessage('partialAmount debe ser numérico'),
          body('discount').optional().isNumeric().withMessage('discount debe ser numérico'),
          body('totalAmount').optional().isNumeric().withMessage('totalAmount debe ser numérico'),
          body('paymentMethod').optional().isIn(Object.values(PaymentMethod)),
          body('paymentStatus').optional().isIn(Object.values(PaymentStatus)),
          body('userAt').optional().isInt({ min: 1 }),
          body('saleItems').optional().isArray()
        ];
      
      default:
        return [];
    }
  }
}