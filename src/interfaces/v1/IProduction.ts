import { ProductionStatus } from '@prisma/client';

export interface IProductionProductInput {
  id?: number;
  product: { id: number };
  quantity: number;
}

export interface IProductionCreate {
  date: string | Date;
  cook: { id: number }; // assignedTo
  userAt: number;
  productionProduct: IProductionProductInput[];
}

export interface IProductionUpdate {
  id: number;
  date?: string | Date;
  cook?: { id: number };
  status?: ProductionStatus;
  userAt?: number;
  productionProduct?: IProductionProductInput[];
}

export interface IProductionService {
  list(date: string): Promise<any[]>;
  add(data: IProductionCreate): Promise<any>;
  modify(data: IProductionUpdate): Promise<any>;
  remove(id: number): Promise<any>;
  ordersProductions(date: string): Promise<any[]>;
  metrics(date?: string): Promise<{
    totalOrdenes: number;
    totalProductos: number;
    produccionProgramada: number;
    produccionEnProceso: number;
    productosDisponibles: number;
  }>;
}