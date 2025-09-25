import { PrismaClient, State } from '@prisma/client';
import { IProduct, IProductCreate, IProductUpdate } from '../../interfaces/v1/IProduct.js';

export class ProductRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<IProduct[]> {
    return this.prisma.product.findMany({
      where: {
        state: State.ACTIVE,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number): Promise<IProduct | null> {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });
    if (!product) return null;
    return product;
  }

  async create(productData: IProductCreate): Promise<IProduct> {
    return this.prisma.product.create({
      data: {
        ...productData,
        state: State.ACTIVE
      }
    });
  }

  async update(productData: IProductUpdate): Promise<IProduct> {
    const { id, ...data } = productData;
    return this.prisma.product.update({
      where: { id },
      data
    });
  }

  async delete(id: number, userAt: number): Promise<IProduct> {
    return this.prisma.product.update({
      where: { id },
      data: {
        state: State.INACTIVE,
        userAt
      }
    });
  }

  async exists(id: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });
    return !!product;
  }
}