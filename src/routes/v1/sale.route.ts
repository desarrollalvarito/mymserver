import { Router } from 'express';
import { SaleController } from '../../controllers/v1/sale.controller.js';
import { validationResultExpress } from '../../middlewares/validationResult.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas protegidas
router.post('/list', authenticateToken, SaleController.validate('list'), validationResultExpress, SaleController.list);
router.get('/stats', authenticateToken, SaleController.stats);
router.post('/create', authenticateToken, SaleController.validate('create'), validationResultExpress, SaleController.create);
router.put('/update', authenticateToken, SaleController.validate('update'), validationResultExpress, SaleController.update);
router.put('/cancel/:id', authenticateToken, SaleController.cancel);
router.get('/:id', authenticateToken, SaleController.getById);

export default router;