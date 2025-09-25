import { DeliveryStatus, OrderStatus, State } from '@prisma/client';

export interface IOrderProductInput {
  id?: number; // para modify
  product: { id: number; price?: any };
  quantity: number;
  state?: State;
}

export interface IOrderDeliveryInput {
  id?: number; // para modify
  driver: { id: number };
  status?: DeliveryStatus;
}

export interface IOrderCreate {
  client: { id: number };
  date: string | Date;
  userAt: number;
  orderProduct: IOrderProductInput[];
  delivery?: IOrderDeliveryInput | null;
}

export interface IOrderUpdate {
  id: number;
  clientId?: number;
  date?: string | Date;
  state?: OrderStatus;
  userAt?: number;
  orderProduct?: IOrderProductInput[];
  delivery?: IOrderDeliveryInput | null;
}

export interface IOrderService {
  list(date: string): Promise<any[]>;
  addOrder(data: IOrderCreate): Promise<any>;
  modifyOrder(data: IOrderUpdate): Promise<any>;
  removeOrder(id: number): Promise<any>;
  total(date: string): Promise<any[]>;
}