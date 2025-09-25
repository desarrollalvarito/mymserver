import { Gender, PrismaClient } from '@prisma/client';
import { PersonRepository } from '../../repositories/v1/person.repository.js';
import { IPerson, IPersonCreate, IPersonService, IPersonUpdate } from '../../interfaces/v1/IPerson.js';

export class PersonService implements IPersonService {
  constructor(private repo: PersonRepository) {}

  async listPersons(): Promise<IPerson[]> {
    try {
      return await this.repo.findAll();
    } catch (error) {
      throw new Error('Error al listar personas: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async addPerson(data: IPersonCreate): Promise<IPerson> {
    try {
      // Validaciones básicas
      if (!data.names || data.names.trim().length < 2) {
        throw new Error('names es requerido y debe tener al menos 2 caracteres');
      }
      if (!Object.values(Gender).includes(data.gender)) {
        throw new Error(`gender debe ser uno de: ${Object.values(Gender).join(', ')}`);
      }

      // Validaciones adicionales
      if (data.run && data.run.trim().length > 0) {
        const existing = await this.repo.findByRun(data.run.trim());
        if (existing) throw new Error('run ya está registrado');
      }

      // Normalizar payload
      const payload: IPersonCreate = {
        run: data.run?.trim() || null,
        names: data.names.trim(),
        lastName: data.lastName?.trim() || null,
        gender: data.gender,
        address: data.address?.trim() || null,
        contact: data.contact?.trim() || null,
        birthdate: data.birthdate ? new Date(data.birthdate as any) : null
      };

      // Validar fecha si viene
      if (payload.birthdate instanceof Date && isNaN(payload.birthdate.getTime())) {
        throw new Error('birthdate inválida');
      }

      return await this.repo.create(payload);
    } catch (error) {
      throw new Error('Error al crear persona: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async modifyPerson(data: IPersonUpdate): Promise<IPerson> {
    try {
      const exists = await this.repo.exists(data.id);
      if (!exists) throw new Error('Persona no encontrada');

      const updateData: IPersonUpdate = { id: data.id };
      if (data.run !== undefined) {
        const normalizedRun = data.run?.trim() || null;
        if (normalizedRun) {
          const existing = await this.repo.findByRun(normalizedRun);
          if (existing && existing.id !== data.id) throw new Error('run ya está registrado por otra persona');
        }
        updateData.run = normalizedRun;
      }

      if (data.names !== undefined) {
        const names = data.names.trim();
        if (names.length < 2) throw new Error('names debe tener al menos 2 caracteres');
        updateData.names = names;
      }

      if (data.lastName !== undefined) updateData.lastName = data.lastName?.trim() || null;

      if (data.gender !== undefined) {
        if (!Object.values(Gender).includes(data.gender)) {
          throw new Error(`gender debe ser uno de: ${Object.values(Gender).join(', ')}`);
        }
        updateData.gender = data.gender;
      }

      if (data.address !== undefined) updateData.address = data.address?.trim() || null;
      if (data.contact !== undefined) updateData.contact = data.contact?.trim() || null;

      if (data.birthdate !== undefined) {
        const parsed = data.birthdate ? new Date(data.birthdate as any) : null;
        if (parsed && isNaN(parsed.getTime())) throw new Error('birthdate inválida');
        updateData.birthdate = parsed;
      }

      return await this.repo.update(updateData);
    } catch (error) {
      throw new Error('Error al modificar persona: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async removePerson(id: number): Promise<IPerson> {
    try {
      const exists = await this.repo.exists(id);
      if (!exists) throw new Error('Persona no encontrada');
      return await this.repo.delete(id);
    } catch (error) {
      throw new Error('Error al eliminar persona: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}