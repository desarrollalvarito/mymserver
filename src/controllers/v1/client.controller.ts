import { Request, Response } from 'express';
import { body, ValidationChain } from 'express-validator';
import { ClientRepository } from '../../repositories/v1/client.repository';
import { ClientService } from '../../services/v1/client.service';
import { prisma } from '../../lib/database';
import { IClientCreate, IClientUpdate } from '../../interfaces/v1/IClient';

// DI: repo + service
const clientRepository = new ClientRepository(prisma);
const clientService = new ClientService(clientRepository);

export class ClientController {
  // GET /list
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const clients = await clientService.listClients();
      return res.json({ success: true, data: clients, count: clients.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /add
  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const { shippingAddress, billName, rut, personId } = req.body as IClientCreate;
      const client = await clientService.addClient({
        shippingAddress: shippingAddress.trim(),
        billName: billName?.trim() || null,
        rut: rut?.trim() || null,
        personId: Number(personId)
      });
      return res.status(201).json({ success: true, message: 'Cliente creado exitosamente', data: client });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // PUT /modify
  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const { id, shippingAddress, billName, rut, personId } = req.body as IClientUpdate;
      const data: IClientUpdate = { id: Number(id) };
      if (shippingAddress !== undefined) data.shippingAddress = shippingAddress.trim();
      if (billName !== undefined) data.billName = billName?.trim() || null;
      if (rut !== undefined) data.rut = rut?.trim() || null;
      if (personId !== undefined) data.personId = Number(personId);

      const client = await clientService.modifyClient(data);
      return res.json({ success: true, message: 'Cliente actualizado exitosamente', data: client });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // DELETE /remove
  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as { id: number | string };
      const client = await clientService.removeClient(Number(id));
      return res.json({ success: true, message: 'Cliente eliminado exitosamente', data: client });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // Validation rules
  static validate(method: 'add' | 'modify' | 'remove'): ValidationChain[] {
    switch (method) {
      case 'add':
        return [
          body('shippingAddress')
            .exists().withMessage('shippingAddress es requerido')
            .notEmpty().withMessage('shippingAddress no puede estar vacío')
            .isLength({ min: 3, max: 100 }).withMessage('shippingAddress debe tener entre 3 y 100 caracteres')
            .trim(),
          body('billName').optional().isLength({ min: 1, max: 100 }).withMessage('billName debe tener hasta 100 caracteres').trim(),
          body('rut').optional().isLength({ min: 6, max: 100 }).withMessage('rut debe tener entre 6 y 100 caracteres').trim(),
          body('personId').exists().withMessage('personId es requerido').isInt({ min: 1 }).withMessage('personId debe ser un número válido')
        ];
      case 'modify':
        return [
          body('id').exists().withMessage('id es requerido').isInt({ min: 1 }).withMessage('id debe ser un número válido'),
          body('shippingAddress').optional().notEmpty().withMessage('shippingAddress no puede estar vacío').isLength({ min: 3, max: 100 }).withMessage('shippingAddress debe tener entre 3 y 100 caracteres').trim(),
          body('billName').optional().isLength({ min: 1, max: 100 }).withMessage('billName debe tener hasta 100 caracteres').trim(),
          body('rut').optional().isLength({ min: 6, max: 100 }).withMessage('rut debe tener entre 6 y 100 caracteres').trim(),
          body('personId').optional().isInt({ min: 1 }).withMessage('personId debe ser un número válido')
        ];
      case 'remove':
        return [body('id').exists().withMessage('id es requerido').isInt({ min: 1 }).withMessage('id debe ser un número válido')];
      default:
        return [];
    }
  }
}