import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ProductService } from '../../services/v1/product.service.js';
import { ProductRepository } from '../../repositories/v1/product.repository.js';

type ValidationChain = ReturnType<typeof body>;
import { prisma } from '../../lib/database.js';
import { IProductCreate, IProductUpdate } from '../../interfaces/v1/IProduct.js';

// Inicializar dependencias
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);

export class ProductController {
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const products = await productService.listProducts();
      return res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async add(req: Request, res: Response): Promise<Response> {
    try {
      const { name, price, userAt }: IProductCreate = req.body;

      const productData: IProductCreate = {
        name: name.trim(),
        price: Number(price),
        userAt: Number(userAt)
      };

      const product = await productService.addProduct(productData);
      
      return res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async modify(req: Request, res: Response): Promise<Response> {
    try {
      const { id, name, price, userAt, state }: IProductUpdate = req.body;

      const productData: IProductUpdate = {
        id: Number(id),
        ...(name && { name: name.trim() }),
        ...(price && { price: Number(price) }),
        ...(userAt && { userAt: Number(userAt) }),
        ...(state && { state })
      };

      const product = await productService.modifyProduct(productData);
      
      return res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async remove(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userAt } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID del producto es requerido'
        });
      }

      const product = await productService.removeProduct(Number(id), Number(userAt));
      
      return res.json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: product
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static validate(method: string): ValidationChain[] {
    switch (method) {
      case 'add':
        return [
          body('name')
            .exists().withMessage('El nombre es requerido')
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
            .trim(),
          body('price')
            .exists().withMessage('El precio es requerido')
            .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
          body('userAt')
            .exists().withMessage('userAt es requerido')
            .isInt({ min: 1 }).withMessage('userAt debe ser un número válido')
        ];
      case 'modify':
        return [
          body('id')
            .exists().withMessage('El ID es requerido')
            .isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
          body('name')
            .optional()
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
            .trim(),
          body('price')
            .optional()
            .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
          body('userAt')
            .optional()
            .isInt({ min: 1 }).withMessage('userAt debe ser un número válido')
        ];
      case 'remove':
        return [
          body('id')
            .exists().withMessage('El ID es requerido')
            .isInt({ min: 1 }).withMessage('ID debe ser un número válido')
        ];
      default:
        return [];
    }
  }
}