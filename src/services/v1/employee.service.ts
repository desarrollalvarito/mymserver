import { EmployeeRepository } from '../../repositories/v1/employee.repository';
import { IEmployee, IEmployeeCreate, IEmployeeService, IEmployeeUpdate } from '../../interfaces/v1/IEmployee';

export class EmployeeService implements IEmployeeService {
  constructor(private repo: EmployeeRepository) {}

  async listEmployees(): Promise<IEmployee[]> {
    try {
      return await this.repo.findAll();
    } catch (error) {
      throw new Error('Error al listar empleados: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async addEmployee(data: IEmployeeCreate): Promise<IEmployee> {
    try {
      if (!data.workShift || data.workShift.trim().length === 0) {
        throw new Error('workShift es requerido');
      }
      if (!data.personId || data.personId <= 0) {
        throw new Error('personId es requerido y debe ser válido');
      }
      return await this.repo.create({
        jobRole: data.jobRole,
        workShift: data.workShift.trim(),
        personId: Number(data.personId)
      });
    } catch (error) {
      throw new Error('Error al crear empleado: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async modifyEmployee(data: IEmployeeUpdate): Promise<IEmployee> {
    try {
      const exists = await this.repo.exists(data.id);
      if (!exists) throw new Error('Empleado no encontrado');

      const updateData: IEmployeeUpdate = { id: data.id };
      if (data.jobRole !== undefined) updateData.jobRole = data.jobRole;
      if (data.workShift !== undefined) updateData.workShift = data.workShift.trim();
      if (data.personId !== undefined) updateData.personId = Number(data.personId);
      if (data.state !== undefined) updateData.state = data.state;

      return await this.repo.update(updateData);
    } catch (error) {
      throw new Error('Error al modificar empleado: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async removeEmployee(id: number): Promise<IEmployee> {
    try {
      const exists = await this.repo.exists(id);
      if (!exists) throw new Error('Empleado no encontrado');
      return await this.repo.delete(id);
    } catch (error) {
      throw new Error('Error al eliminar empleado: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}