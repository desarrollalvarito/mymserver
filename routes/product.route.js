import { Router } from "express";
import { listProduct, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router()

router.get('/list', listProduct)
router.post('/create', createProduct)
router.put('/update', updateProduct)
router.delete('/delete', deleteProduct)

export default router