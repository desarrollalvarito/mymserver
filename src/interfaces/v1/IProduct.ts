import { State } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IProduct {
  id: number;
  name: string;
  price: number | Decimal;
  state: State;
  createdAt: Date;
  updatedAt: Date;
  userAt: number;
}

export interface IProductCreate {
  name: string;
  price: number | Decimal;
  userAt: number;
}

export interface IProductUpdate {
  id: number;
  name?: string;
  price?: number | Decimal;
  userAt?: number;
  state?: State;
}

export interface IProductService {
  listProducts(): Promise<IProduct[]>;
  addProduct(productData: IProductCreate): Promise<IProduct>;
  modifyProduct(productData: IProductUpdate): Promise<IProduct>;
  removeProduct(id: number, userAt: number): Promise<IProduct>;
}