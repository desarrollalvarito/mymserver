import { Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../../lib/database.js';
import { ProductionRepository } from '../../repositories/v1/production.repository.js';
import { ProductionService } from '../../services/v1/production.service.js';
import { IProductionCreate, IProductionUpdate } from '../../interfaces/v1/IProduction.js';
import { ProductionStatus } from '@prisma/client';

type ValidationChain = ReturnType<typeof body>;

const repo = new ProductionRepository(prisma);
const service = new ProductionService(repo, prisma);

export class ProductionController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date: string };
      const data = await service.list(date);
      return res.json({ success: true, data, count: data.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as IProductionCreate;
      const created = await service.add(payload);
      return res.status(201).json({ success: true, message: 'Producción creada exitosamente', data: created });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as IProductionUpdate;
      const updated = await service.modify(payload);
      return res.json({ success: true, message: 'Producción actualizada exitosamente', data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as any;
      const production = await service.remove(Number(id));
      return res.json({ success: true, message: 'Producción cancelada exitosamente', data: production });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async ordersProductions(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date: string };
      const data = await service.ordersProductions(date);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async productionMetrics(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date?: string };
      const data = await service.metrics(date);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static validate(method: string): ValidationChain[] {
    switch (method) {
      case 'list':
        return [body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido')];
      case 'add':
        return [
          body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido'),
          body('cook.id').exists().withMessage('cook.id es requerido').isInt({ min: 1 }),
          body('userAt').exists().withMessage('userAt es requerido').isInt({ min: 1 }),
          body('productionProduct').isArray({ min: 1 }).withMessage('productionProduct debe tener al menos 1 item'),
          body('productionProduct.*.product.id').exists().withMessage('product.id es requerido').isInt({ min: 1 }),
          body('productionProduct.*.quantity').exists().withMessage('quantity es requerido').isInt({ min: 1 }),
        ];
      case 'modify':
        return [
          body('id').exists().withMessage('id es requerido').isInt({ min: 1 }),
          body('date').optional().isISO8601().withMessage('date inválido'),
          body('cook.id').optional().isInt({ min: 1 }),
          body('status').optional().isIn(Object.values(ProductionStatus)),
          body('userAt').optional().isInt({ min: 1 }),
          body('productionProduct').optional().isArray(),
          body('productionProduct.*.id').optional().isInt({ min: 1 }),
          body('productionProduct.*.product.id').optional().isInt({ min: 1 }),
          body('productionProduct.*.quantity').optional().isInt({ min: 1 }),
        ];
      case 'remove':
        return [body('id').exists().withMessage('id es requerido').isInt({ min: 1 })];
      case 'ordersProductions':
        return [body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido')];
      case 'productionMetrics':
        return [body('date').optional().isISO8601().withMessage('date inválido')];
      default:
        return [];
    }
  }
}