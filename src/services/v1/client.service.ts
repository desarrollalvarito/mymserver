import { ClientRepository } from '../../repositories/v1/client.repository';
import { IClient, IClientCreate, IClientService, IClientUpdate } from '../../interfaces/v1/IClient';

export class ClientService implements IClientService {
  private clientRepository: ClientRepository;

  constructor(clientRepository: ClientRepository) {
    this.clientRepository = clientRepository;
  }

  async listClients(): Promise<IClient[]> {
    try {
      return await this.clientRepository.findAll();
    } catch (error) {
      throw new Error('Error al listar clientes: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async addClient(data: IClientCreate): Promise<IClient> {
    try {
      if (!data.shippingAddress || data.shippingAddress.trim().length < 3) {
        throw new Error('shippingAddress es requerido y debe tener al menos 3 caracteres');
      }
      if (!data.personId || data.personId <= 0) {
        throw new Error('personId es requerido y debe ser válido');
      }
      return await this.clientRepository.create({
        shippingAddress: data.shippingAddress.trim(),
        billName: data.billName?.trim() || null,
        rut: data.rut?.trim() || null,
        personId: Number(data.personId)
      });
    } catch (error) {
      throw new Error('Error al crear cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async modifyClient(data: IClientUpdate): Promise<IClient> {
    try {
      const exists = await this.clientRepository.exists(data.id);
      if (!exists) throw new Error('Cliente no encontrado');

      const updateData: IClientUpdate = { id: data.id };
      if (data.shippingAddress !== undefined) updateData.shippingAddress = data.shippingAddress.trim();
      if (data.billName !== undefined) updateData.billName = data.billName?.trim() || null;
      if (data.rut !== undefined) updateData.rut = data.rut?.trim() || null;
      if (data.personId !== undefined) updateData.personId = Number(data.personId);

      return await this.clientRepository.update(updateData);
    } catch (error) {
      throw new Error('Error al modificar cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async removeClient(id: number): Promise<IClient> {
    try {
      const exists = await this.clientRepository.exists(id);
      if (!exists) throw new Error('Cliente no encontrado');
      return await this.clientRepository.delete(id);
    } catch (error) {
      throw new Error('Error al eliminar cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}