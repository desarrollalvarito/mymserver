import { Router } from "express";
import { list, add, modify, remove, totalOrdersProductions, productionMetrics } from "../controllers/production.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/list', list)
router.post('/ordersproductions', totalOrdersProductions)
router.post('/productionmetrics', productionMetrics)
router.post('/add', authenticateToken, add)
router.put('/modify', authenticateToken, modify)
router.delete('/remove', authenticateToken, remove)

export default router