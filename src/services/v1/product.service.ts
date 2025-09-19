import { ProductRepository } from '../../repositories/v1/product.repository';
import { IProduct, IProductCreate, IProductUpdate, IProductService } from '../../interfaces/v1/IProduct';

export class ProductService implements IProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async listProducts(): Promise<IProduct[]> {
    try {
      return await this.productRepository.findAll();
    } catch (error) {
      throw new Error('Error al listar productos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async addProduct(productData: IProductCreate): Promise<IProduct> {
    try {
      // Validaciones básicas
      if (!productData.name || productData.name.trim().length === 0) {
        throw new Error('El nombre del producto es requerido');
      }

      if (productData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      return await this.productRepository.create(productData);
    } catch (error) {
      throw new Error('Error al crear producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async modifyProduct(productData: IProductUpdate): Promise<IProduct> {
    try {
      const { id, ...updateData } = productData;

      // Verificar que el producto existe
      const productExists = await this.productRepository.exists(id);
      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      // Validaciones
      if (updateData.name !== undefined && updateData.name.trim().length === 0) {
        throw new Error('El nombre del producto no puede estar vacío');
      }

      if (updateData.price !== undefined && updateData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      return await this.productRepository.update(productData);
    } catch (error) {
      throw new Error('Error al modificar producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async removeProduct(id: number, userAt: number): Promise<IProduct> {
    try {
      // Verificar que el producto existe
      const productExists = await this.productRepository.exists(id);
      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      return await this.productRepository.delete(id, userAt);
    } catch (error) {
      throw new Error('Error al eliminar producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}