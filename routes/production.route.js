import { Router } from "express";
import { list, add, modify, remove, totalProductions } from "../controllers/production.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/list', list)
router.post('/total', totalProductions)
router.post('/add', authenticateToken, add)
router.put('/modify', authenticateToken, modify)
router.delete('/remove', authenticateToken, remove)

export default router