import { Router } from "express";
import { list, add, modify, remove } from "../controllers/employee.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/list', list)
router.post('/add', add)
router.get('/modify', modify)
router.get('/remove', remove)

export default router