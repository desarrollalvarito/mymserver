import { Router } from "express";
import { AuthController } from "../../controllers/v1/auth.controller.js";
import { validationResultExpress } from "../../middlewares/validationResult.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public: /auth/login y /auth/get
router.post('/login', AuthController.validate('login'), validationResultExpress, AuthController.login);
router.get('/get', AuthController.getUsers);

// Protegidas
router.post('/logout', authenticateToken, validationResultExpress, AuthController.logout);
router.post('/refresh', authenticateToken, AuthController.refreshToken);
router.get('/session', authenticateToken, AuthController.getSession);
router.post('/create', authenticateToken, AuthController.validate('create'), validationResultExpress, AuthController.createUser);
router.put('/update', authenticateToken, AuthController.validate('update'), validationResultExpress, AuthController.updateUser);

export default router;