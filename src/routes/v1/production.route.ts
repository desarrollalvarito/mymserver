import { Router } from "express";
import { ProductionController } from "../../controllers/v1/production.controller";
import { validationResultExpress } from "../../middlewares/validationResult";
import { authenticateToken } from "../../middlewares/auth.middleware";

const router = Router()

router.post('/list', authenticateToken, ProductionController.validate('list'), validationResultExpress, ProductionController.list)
router.post('/ordersproductions', authenticateToken, ProductionController.validate('ordersProductions'), validationResultExpress, ProductionController.ordersProductions)
router.post('/productionmetrics', authenticateToken, ProductionController.validate('productionMetrics'), validationResultExpress, ProductionController.productionMetrics)
router.post('/add', authenticateToken, ProductionController.validate('add'), validationResultExpress, ProductionController.add)
router.put('/modify', authenticateToken, ProductionController.validate('modify'), validationResultExpress, ProductionController.modify)
router.delete('/remove', authenticateToken, ProductionController.validate('remove'), validationResultExpress, ProductionController.remove)

export default router