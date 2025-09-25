import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface ISaleItemInput {
  productId: number;
  quantity: number;
  unitPrice: number | string;
  totalPrice?: number | string;
}

export interface ISaleCreate {
  orderId: number;
  date: string | Date;
  partialAmount: number | string;
  discount?: number | string;
  totalAmount: number | string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  userAt: number;
  saleItems: ISaleItemInput[];
}

export interface ISaleUpdate {
  id: number;
  date?: string | Date;
  partialAmount?: number | string;
  discount?: number | string;
  totalAmount?: number | string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  userAt?: number;
  saleItems?: ISaleItemInput[];
}

export interface ISaleService {
  list(date: string): Promise<any[]>;
  getById(id: number): Promise<any>;
  createSale(data: ISaleCreate): Promise<any>;
  updateSale(data: ISaleUpdate): Promise<any>;
  cancelSale(id: number): Promise<any>;
  getSalesStats(startDate?: string, endDate?: string): Promise<any>;
}