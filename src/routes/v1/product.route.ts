import { Router } from "express";
import { ProductController } from "../../controllers/v1/product.controller.js";
import { validationResultExpress } from "../../middlewares/validationResult.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get('/list', authenticateToken, ProductController.list);
router.post('/add', authenticateToken, ProductController.validate('add'), validationResultExpress, ProductController.add);
router.put('/modify', authenticateToken, ProductController.validate('modify'), validationResultExpress, ProductController.modify);
router.delete('/remove', authenticateToken, ProductController.validate('remove'), validationResultExpress, ProductController.remove);

export default router;