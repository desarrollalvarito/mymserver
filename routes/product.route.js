import { Router } from "express";
import { get } from "../controllers/product.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router()

router.get('/get', get)

export default router