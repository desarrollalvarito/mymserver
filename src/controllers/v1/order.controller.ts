import { Request, Response } from 'express';
import { body, ValidationChain } from 'express-validator';
import { prisma } from '../../lib/database';
import { OrderStatus } from '@prisma/client';
import { OrderRepository } from '../../repositories/v1/order.repository';
import { OrderService } from '../../services/v1/order.service';
import { IOrderCreate, IOrderUpdate } from '../../interfaces/v1/IOrder';

const orderRepository = new OrderRepository(prisma);
const orderService = new OrderService(orderRepository, prisma);

export class OrderController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date: string };
      const data = await orderService.list(date);
      return res.json({ success: true, data, count: data.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as IOrderCreate;
      const created = await orderService.addOrder(payload);
      return res.status(201).json({ success: true, message: 'Orden creada exitosamente', data: created });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body as IOrderUpdate;
      const updated = await orderService.modifyOrder(payload);
      return res.json({ success: true, message: 'Orden actualizada exitosamente', data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as any;
      const order = await orderService.removeOrder(Number(id));
      return res.json({ success: true, message: 'Orden cancelada exitosamente', data: order });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async total(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = req.body as { date: string };
      const data = await orderService.total(date);
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
          body('client.id').exists().withMessage('client.id es requerido').isInt({ min: 1 }),
          body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido'),
          body('userAt').exists().withMessage('userAt es requerido').isInt({ min: 1 }),
          body('orderProduct').isArray({ min: 1 }).withMessage('orderProduct debe tener al menos 1 item'),
          body('orderProduct.*.product.id').exists().withMessage('product.id es requerido').isInt({ min: 1 }),
          body('orderProduct.*.quantity').exists().withMessage('quantity es requerido').isInt({ min: 1 }),
          body('orderProduct.*.aditional').optional().isBoolean().withMessage('aditional debe ser boolean'),
        ];
      case 'modify':
        return [
          body('id').exists().withMessage('id es requerido').isInt({ min: 1 }),
          body('clientId').optional().isInt({ min: 1 }),
          body('date').optional().isISO8601().withMessage('date inválido'),
          body('state').optional().isIn(Object.values(OrderStatus)),
          body('userAt').optional().isInt({ min: 1 }),
          body('orderProduct').optional().isArray(),
          body('orderProduct.*.id').optional().isInt({ min: 1 }),
          body('orderProduct.*.product.id').optional().isInt({ min: 1 }),
          body('orderProduct.*.quantity').optional().isInt({ min: 1 }),
          body('orderProduct.*.aditional').optional().isBoolean(),
          body('delivery.id').optional().isInt({ min: 1 }),
          body('delivery.driver.id').optional().isInt({ min: 1 }),
        ];
      case 'remove':
        return [body('id').exists().withMessage('id es requerido').isInt({ min: 1 })];
      case 'total':
        return [body('date').exists().withMessage('date es requerido').isISO8601().withMessage('date inválido')];
      default:
        return [];
    }
  }
}