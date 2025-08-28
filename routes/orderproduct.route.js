import { Router } from "express";
import { list, add, modify, remove } from "../controllers/orderproduct.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/list', authenticateToken, list)
router.post('/add', authenticateToken, add)
router.put('/modify', authenticateToken, modify)
router.delete('/remove', authenticateToken, remove)

export default router