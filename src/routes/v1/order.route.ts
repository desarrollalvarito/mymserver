import { Router } from 'express';
import { OrderController } from '../../controllers/v1/order.controller.js';
import { validationResultExpress } from '../../middlewares/validationResult.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas protegidas
router.post('/list', authenticateToken, OrderController.validate('list'), validationResultExpress, OrderController.list);
router.post('/total', authenticateToken, OrderController.validate('total'), validationResultExpress, OrderController.total);
router.post('/add', authenticateToken, OrderController.validate('add'), validationResultExpress, OrderController.add);
router.put('/modify', authenticateToken, OrderController.validate('modify'), validationResultExpress, OrderController.modify);
router.delete('/remove', authenticateToken, OrderController.validate('remove'), validationResultExpress, OrderController.remove);

export default router;