import { Request, Response } from 'express';
import { body } from 'express-validator';
import { JobRoles, State } from '@prisma/client';
import { prisma } from '../../lib/database.js';

type ValidationChain = ReturnType<typeof body>;
import { EmployeeRepository } from '../../repositories/v1/employee.repository.js';
import { EmployeeService } from '../../services/v1/employee.service.js';
import { IEmployeeCreate, IEmployeeUpdate } from '../../interfaces/v1/IEmployee.js';

// DI
const repo = new EmployeeRepository(prisma);
const service = new EmployeeService(repo);

export class EmployeeController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const employees = await service.listEmployees();
      return res.json({ success: true, data: employees, count: employees.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const { jobRole, workShift, personId } = req.body as IEmployeeCreate;
      const employee = await service.addEmployee({
        jobRole,
        workShift: workShift.trim(),
        personId: Number(personId)
      });
      return res.status(201).json({ success: true, message: 'Empleado creado exitosamente', data: employee });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const { id, jobRole, workShift, personId, state } = req.body as IEmployeeUpdate;
      const data: IEmployeeUpdate = { id: Number(id) };
      if (jobRole !== undefined) data.jobRole = jobRole;
      if (workShift !== undefined) data.workShift = workShift.trim();
      if (personId !== undefined) data.personId = Number(personId);
      if (state !== undefined) data.state = state;

      const employee = await service.modifyEmployee(data);
      return res.json({ success: true, message: 'Empleado actualizado exitosamente', data: employee });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as { id: number | string };
      const employee = await service.removeEmployee(Number(id));
      return res.json({ success: true, message: 'Empleado eliminado exitosamente', data: employee });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static validate(method: 'add' | 'modify' | 'remove'): ValidationChain[] {
    switch (method) {
      case 'add':
        return [
          body('jobRole')
            .exists().withMessage('jobRole es requerido')
            .isString().withMessage('jobRole debe ser string')
            .isIn(Object.values(JobRoles)).withMessage(`jobRole debe ser uno de: ${Object.values(JobRoles).join(', ')}`),
          body('workShift')
            .exists().withMessage('workShift es requerido')
            .notEmpty().withMessage('workShift no puede estar vacío')
            .isLength({ min: 2, max: 50 }).withMessage('workShift debe tener entre 2 y 50 caracteres')
            .trim(),
          body('personId').exists().withMessage('personId es requerido').isInt({ min: 1 }).withMessage('personId debe ser válido')
        ];
      case 'modify':
        return [
          body('id').exists().withMessage('id es requerido').isInt({ min: 1 }).withMessage('id debe ser válido'),
          body('jobRole')
            .optional()
            .isString().withMessage('jobRole debe ser string')
            .isIn(Object.values(JobRoles)).withMessage(`jobRole debe ser uno de: ${Object.values(JobRoles).join(', ')}`),
          body('workShift').optional().notEmpty().withMessage('workShift no puede estar vacío').isLength({ min: 2, max: 50 }).withMessage('workShift debe tener entre 2 y 50 caracteres').trim(),
          body('personId').optional().isInt({ min: 1 }).withMessage('personId debe ser válido'),
          body('state')
            .optional()
            .isString().withMessage('state debe ser string')
            .isIn(Object.values(State)).withMessage(`state debe ser uno de: ${Object.values(State).join(', ')}`)
        ];
      case 'remove':
        return [body('id').exists().withMessage('id es requerido').isInt({ min: 1 }).withMessage('id debe ser válido')];
      default:
        return [];
    }
  }
}