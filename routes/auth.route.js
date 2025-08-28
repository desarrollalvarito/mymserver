import { Router } from "express";
import { validate, login, logout, create, update, get, session, refreshToken } from "../controllers/auth.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/login', validate('login'), validationResultExpress, login)
router.post('/logout', authenticateToken,validationResultExpress, logout)
router.post('/refresh', refreshToken)
router.get('/session', authenticateToken, session)
router.get('/get', get)
router.post('/create', validate('create'), validationResultExpress, create)
router.put('/update', validate('update'), validationResultExpress, update)

export default router