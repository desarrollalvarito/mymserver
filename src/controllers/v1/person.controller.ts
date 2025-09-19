import { Request, Response } from 'express';
import { body, ValidationChain } from 'express-validator';
import { prisma } from '../../lib/database';
import { PersonRepository } from '../../repositories/v1/person.repository';
import { PersonService } from '../../services/v1/person.service';
import { IPersonCreate, IPersonUpdate } from '../../interfaces/v1/IPerson';
import { Gender } from '@prisma/client';

// Inicializar dependencias
const personRepository = new PersonRepository(prisma);
const personService = new PersonService(personRepository);

export class PersonController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const people = await personService.listPersons();
      return res.json({ success: true, data: people, count: people.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const { run, names, lastName, gender, address, contact, birthdate }: IPersonCreate = req.body;

      const payload: IPersonCreate = {
        run: run?.toString().trim() || null,
        names: names.trim(),
        lastName: lastName?.toString().trim() || null,
        gender: gender as Gender,
        address: address?.toString().trim() || null,
        contact: contact?.toString().trim() || null,
        birthdate: birthdate ? new Date(birthdate as any).toISOString() : null,
      };

      const person = await personService.addPerson(payload);
      return res.status(201).json({ success: true, message: 'Persona creada exitosamente', data: person });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const { id, run, names, lastName, gender, address, contact, birthdate }: IPersonUpdate = req.body;

      const payload: IPersonUpdate = {
        id: Number(id),
        ...(run !== undefined && { run: run?.toString().trim() || null }),
        ...(names !== undefined && { names: names.trim() }),
        ...(lastName !== undefined && { lastName: lastName?.toString().trim() || null }),
        ...(gender !== undefined && { gender: gender as Gender }),
        ...(address !== undefined && { address: address?.toString().trim() || null }),
        ...(contact !== undefined && { contact: contact?.toString().trim() || null }),
        ...(birthdate !== undefined && { birthdate: birthdate ? new Date(birthdate as any).toISOString() : null }),
      };

      const person = await personService.modifyPerson(payload);
      return res.json({ success: true, message: 'Persona actualizada exitosamente', data: person });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body;
      const person = await personService.removePerson(Number(id));
      return res.json({ success: true, message: 'Persona eliminada exitosamente', data: person });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static validate(method: string): ValidationChain[] {
    switch (method) {
      case 'add':
        return [
          body('names')
            .exists().withMessage('names es requerido')
            .isString().withMessage('names debe ser string')
            .isLength({ min: 2 }).withMessage('names debe tener al menos 2 caracteres')
            .trim(),
          body('gender')
            .exists().withMessage('gender es requerido')
            .isIn(Object.values(Gender)).withMessage(`gender debe ser uno de: ${Object.values(Gender).join(', ')}`),
          body('run')
            .optional({ nullable: true })
            .isString().withMessage('run debe ser string')
            .isLength({ max: 50 }).withMessage('run máximo 50 caracteres')
            .trim(),
          body('lastName')
            .optional({ nullable: true })
            .isString().withMessage('lastName debe ser string')
            .isLength({ max: 50 }).withMessage('lastName máximo 50 caracteres')
            .trim(),
          body('address')
            .optional({ nullable: true })
            .isString().withMessage('address debe ser string')
            .isLength({ max: 250 }).withMessage('address máximo 250 caracteres')
            .trim(),
          body('contact')
            .optional({ nullable: true })
            .isString().withMessage('contact debe ser string')
            .isLength({ max: 50 }).withMessage('contact máximo 50 caracteres')
            .trim(),
          body('birthdate')
            .optional({ nullable: true })
            .isISO8601().withMessage('birthdate debe ser una fecha válida')
        ];
      case 'modify':
        return [
          body('id')
            .exists().withMessage('id es requerido')
            .isInt({ min: 1 }).withMessage('id debe ser un número válido'),
          body('names')
            .optional()
            .isString().withMessage('names debe ser string')
            .isLength({ min: 2 }).withMessage('names debe tener al menos 2 caracteres')
            .trim(),
          body('gender')
            .optional()
            .isIn(Object.values(Gender)).withMessage(`gender debe ser uno de: ${Object.values(Gender).join(', ')}`),
          body('run')
            .optional({ nullable: true })
            .isString().withMessage('run debe ser string')
            .isLength({ max: 50 }).withMessage('run máximo 50 caracteres')
            .trim(),
          body('lastName')
            .optional({ nullable: true })
            .isString().withMessage('lastName debe ser string')
            .isLength({ max: 50 }).withMessage('lastName máximo 50 caracteres')
            .trim(),
          body('address')
            .optional({ nullable: true })
            .isString().withMessage('address debe ser string')
            .isLength({ max: 250 }).withMessage('address máximo 250 caracteres')
            .trim(),
          body('contact')
            .optional({ nullable: true })
            .isString().withMessage('contact debe ser string')
            .isLength({ max: 50 }).withMessage('contact máximo 50 caracteres')
            .trim(),
          body('birthdate')
            .optional({ nullable: true })
            .isISO8601().withMessage('birthdate debe ser una fecha válida')
        ];
      case 'remove':
        return [
          body('id')
            .exists().withMessage('id es requerido')
            .isInt({ min: 1 }).withMessage('id debe ser un número válido')
        ];
      default:
        return [];
    }
  }
}