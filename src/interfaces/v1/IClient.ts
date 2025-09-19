import { Person } from '@prisma/client';

export interface IClient {
  id: number;
  shippingAddress: string;
  billName?: string | null;
  rut?: string | null;
  personId: number;
  person?: Person; // Included in list queries
}

export interface IClientCreate {
  shippingAddress: string;
  billName?: string | null;
  rut?: string | null;
  personId: number;
}

export interface IClientUpdate {
  id: number;
  shippingAddress?: string;
  billName?: string | null;
  rut?: string | null;
  personId?: number;
}

export interface IClientService {
  listClients(): Promise<IClient[]>;
  addClient(data: IClientCreate): Promise<IClient>;
  modifyClient(data: IClientUpdate): Promise<IClient>;
  removeClient(id: number): Promise<IClient>;
}